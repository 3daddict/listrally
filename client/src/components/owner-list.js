import '../assets/css/list_owner.scss';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Header from './header';
import DatePicker from './date-picker';
import ErrorMessage from './error_message.js';

import { Fragment } from 'react';
import { Field, reduxForm } from 'redux-form';
import { addSingleItem } from '../actions/index';
import { getListData, updateListInfo } from '../actions/index';
import handPlaceholderImg from '../assets/images/list-hand-placeholder.png';

import AddListItemButton from './buttons/add_list_item_button'
import ListItems from './owner-list-item';
import Footer from './footer';

const style = {
    height: '400px',
    opacity: 0.4
}

class OwnerList extends Component{

    constructor(props){
        super(props);
        this.url = this.props.match.params.url;
    }

    state = {
        edit: false,
        date: [new Date()],
        itemNameApproved: true
    }

    componentDidMount() {
        this.props.getListData(this.url);
    }

    enableEdit=()=>{
        this.setState({
            edit: true
        })
    }

    getDate =( dateString )=>{
        this.setState({
            date: dateString
        });
    }

    changeDate = ()=>{
        const {list} =this.props;
        const updatedListObject = {...list[0]};
        updatedListObject.eventTime = this.state.date[0].toJSON().slice(0, 19).replace('T', ' ');
        this.props.updateListInfo(updatedListObject);
        this.props.getListData(this.url);
        this.setState({
            edit: false
        })
        this.props.getListData(this.url);
    }

    goBack = () => {
        this.props.history.goBack();
    }

    renderInput = (props) => {
        const { input } = props;
        return (
            <div className="row">
                <input className="add-input-field" {...input} type="text" autoComplete="off" placeholder="Eg. plastic plates" />
                <AddListItemButton className="add-item-button btn btn-green" name="Add" />
            </div>
        )
    }

    submitItem = (values) => {
        if(Object.keys(values).length === 0 && values.constructor === Object){
            if(this.state.itemNameApproved){
                setTimeout(this.setState.bind(this, {itemNameApproved: true}) , 2000);
            }
            this.setState({
                itemNameApproved: false
            });
            return;
        }
        const {reset, list} = this.props;
        if(list.length>0){
             var {ID: listID} = list[0];
        }
        const { itemName : name } = values;
        const testObject = {name, listID, assignedUserID: 0}
        this.props.addSingleItem(testObject);
        this.props.getListData(this.url);
        reset();//clears form after submitting
    }

    render(){
        const {handleSubmit} = this.props;
        let {items, list, userInfo } = this.props;
        if(userInfo.avatar){
            var { avatar } = userInfo;
        }
        const listItems = items.map(item=>{
            return <ListItems key={item.ID} {...item} url={this.url} userInfo={userInfo} />
        })
        return(
            <div className="col-2">
                {this.state.itemNameApproved ? null : <ErrorMessage message='Item must have a name' />}
                <header>
                    <Header url={this.url} buttons={['Back_button', 'Home_nav_button', 'List_link_button']} history={this.props.history} avatar={userInfo.avatar ? avatar: null}  login={this.props.userInfo.ID}  />
                </header> 
                <div className='content'>
                    <div className="layout-container">
                        <div className="list-top">
                            <h4 className="list-title">{list.length>0 ? list[0].name : ''}</h4>
                            <div className="list-details">{list.length>0 ? list[0].description : ''}</div>
                            {this.state.edit ?
                                <div>
                                    <fieldset className="date-fieldset">
                                    <legend className="form-input-label date-input-label">Change Date and Time</legend>
                                        <div>
                                            <DatePicker sendDate={this.getDate} currentDate={this.state.date} /><span className="date-note"> ◄ Select date</span>
                                        </div>
                                    </fieldset>
                                    <button onClick={this.changeDate} type="submit" className="btn btn-green">Change</button>
                                </div>
                                : 
                                <div className="list-date">
                                    {list.length>0 ? this.props.list[0].userTimeFormat : ''}
                                    <div onClick={this.enableEdit} className="edit-date"><i className="fas fa-pen"></i></div>
                                </div>
                            }
                        </div>
                    <div className="add">                       
                        <form className='add-item-form-container' onSubmit={handleSubmit(this.submitItem)}>
                            <Field name="itemName" type="text" component={this.renderInput} label="Add Item"/>
                        </form>
                    </div>
                    <div className="list-items">
                        {this.props.items[0] ? listItems : <img style={style} src={handPlaceholderImg}/> }
                    </div>
                    </div>
                </div>
                <footer>
                    <Link to={`/list-shared/${this.url}`}><Footer buttons={['next_page_button']} /></Link>
                </footer>
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        list: state.list.list,
        items: state.list.items,
        userInfo: state.user.userInfo
    }
}

OwnerList = reduxForm({
    form: 'add_item',
})(OwnerList);

export default connect(mapStateToProps,{
    addSingleItem, getListData, updateListInfo
})(OwnerList); 