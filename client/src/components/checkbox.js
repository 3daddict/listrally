import React, { Component } from 'react';
import '../assets/css/tooltips.css';
import '../assets/css/checkbox.css';
import { Fragment } from 'react';
import { connect } from 'react-redux';
import { sendCheckboxInfo, deleteItem, getListData, updateListData } from '../actions';
import blankImage from '../assets/images/nothing.png';
import SignInModal from './sign-in-modal';
import loading from '../assets/images/user.png';

const crossedOutTextStyle = {
    textDecoration: 'line-through'
}

class Checkbox extends Component {
    constructor(props){
        super(props);
        this.state = {
            isChecked: !!props.assignedUserID,
            style: {},
            isLogOn: true,
            isOpen: false,
            random: true
        }
        this.toggleCheck = this.toggleCheck.bind(this);
    }


    open = () => this.setState({isOpen: true});
    close = () => this.setState({isOpen: false});


    toggleCheck(){
        const { assignedUserID, userInfo } = this.props;
        const {ID: userID} = userInfo;
        if(!userID){//if user is not logged in
            this.setState({
                isLogOn: false,
            })
            this.open();
            return;
        }
        if(userID!==assignedUserID && assignedUserID>0){//if user is not the one who checked the box
            //and the box has already been checked
            return;
        }
        if(userID===assignedUserID){//if the user is the one who checked the box first
            this.setState({//allow checkbox to be toggled
                isChecked: !this.state.isChecked
            })
            this.sendInfoToServer();
            return;
        }
        this.setState({
            isChecked: !this.state.isChecked,
        })
        this.sendInfoToServer();
    }

    sendInfoToServer = () => {
        //const { ID, name, listID, assignedUserID } = request.body;
        let { ID, listID, itemName: name, userInfo : {ID: userID}, assignedUserID} = this.props;
        if(userID===assignedUserID){//if box is checked and user is the one who checked it
            assignedUserID = 0;//removes their name and sets checkbox back to being unchecked
        } else{
            assignedUserID = userID;
        }
        const checkboxObject = {ID, name, listID, assignedUserID};
        this.props.sendCheckboxInfo(checkboxObject);
        this.props.getListData(this.props.url);
        this.props.updateListData(listID)
    }


    render(){
        // const { ID, name, listID, assignedUserID } = request.body;
        const {name} = this.props;
        if(this.props.avatar){
            var {avatar} = this.props;
        } else{
            avatar = user;
        }
        const {isChecked} = this.state;
        return (
            <div className="list_item">
                <div className="shared-left">
                    <label className="label-container">
                        <input type="checkbox" name={name} value={name} checked={isChecked ? 'checked' : false}  onChange={this.toggleCheck} />
                        <span className="checkmark"></span>
                        <label style={isChecked ? crossedOutTextStyle : this.state.style } >{this.props.itemName}</label>
                        <label className="checkbox-login"><SignInModal isOpen={this.state.isOpen} close={this.close}/></label>
                    </label>
                </div>
                <div className="shared-right">
                    <span tooltip={this.props.userName}>
                        <img className="person" src={isChecked ? avatar : blankImage} alt="user"/>
                    </span>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        list: state.list.list,
        items: state.list.items,
        userInfo: state.user.userInfo,
    }
}


export default connect(mapStateToProps,{
    sendCheckboxInfo, deleteItem, getListData, updateListData
})(Checkbox); 
