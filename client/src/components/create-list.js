import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { Field, reduxForm } from 'redux-form';
import { renderDate } from '../helpers';
import '../assets/css/create-list.scss';
import { createListData, authenticate } from '../actions';
import Header from './header';
import Footer from './footer';
import DatePicker from './date-picker';
import SignInModal from './sign-in-modal';
import LoadingSpinner from './loading_spinner.js';
// import '../../node_modules/flatpickr/dist/themes/airbnb.css'
// import Flatpickr from 'react-flatpickr'

class CreateList extends Component{
    constructor() {
        super();
        this.createListState = {};
        this.state = {
            saved: false,
            description: '',
            name: '',
            eventTime: '',
            modalStatus: false,
        };
        this.getDate = this.getDate.bind(this);
    }

    renderInput = (props) => {
        const {input, label, type, meta: { error, touched }} = props;
        return (
            <div>
                <div className="form-row">
                    <div className="form-col">
                        <label className="form-input-label">{label}</label>
                        <input className="form-input-field" {...input} type={ type || 'text' } placeholder={props.placeholder} autoComplete="off"  />
                        <span className="form-helper-text">{ touched && error }</span>
                    </div>
                </div>
            </div>
        );
    }

    renderTextArea = (props) => {
        const {input, label, caption, type, meta: { error, touched }} = props;
        return (
            <div>
                <div className="form-row">
                    <div className="form-col">
                        <label className="form-input-label date-label">{label}</label>
                        <label className="textarea-caption">{caption}</label>
                        <textarea className="form-textarea-field" {...input} type={ type || 'input' } placeholder={props.placeholder} autoComplete="off"  />
                        <span className="form-helper-text">{ touched && error }</span>
                    </div>
                </div>
            </div>
        );
    }

    open = () => this.setState({isOpen: true});
    close = () => this.setState({modalStatus: false});

    getDate( dateString ){
        this.setState({
            date: dateString
        });
    }

    userCreateListData = (values) => {
        values.eventTime = this.state.date;
        if(!values.eventTime) return;
        if(!this.props.userInfo.ID){//if user is not logged in
            localStorage.setItem('eventName', values.eventName);
            localStorage.setItem('eventDescription', values.eventDescription);
            localStorage.setItem('eventTime', values.eventTime[0]);

            this.setState({
                modalStatus: true
            });
            return;
        }
        let {eventDescription: description, eventName: name, eventTime} = values;
        const securityStatus = "locked";
        eventTime = eventTime[0].toJSON().slice(0, 19).replace('T', ' ');
        const newEventObject = { name, description, securityStatus, eventTime };
        this.props.createListData(newEventObject, this.causeRedirectToNewListPage.bind(this));
    }
    causeRedirectToNewListPage(){
        this.setState({
            saved: true
        });
    }

    componentDidMount(){
        this.props.authenticate();
        if( this.createListState){
            this.getDate( this.createListState.eventTime );
        }
        if(!this.props.userInfo.ID){//if user is not logged in, then clear cache
            localStorage.clear();
        }
    }

    render(){
        this.createListState.eventName = localStorage.getItem('eventName');
        this.createListState.eventDescription = localStorage.getItem('eventDescription');
        this.createListState.eventTime = localStorage.getItem('eventTime');
        const { handleSubmit, userInfo } = this.props;
        const {ID, avatar} = userInfo;
        const { saved, description, name, eventTime } = this.state;

        return(
            <div className="col-2">
            {this.state.saved ? <LoadingSpinner/> : null}
                <header>
                    <Header buttons={['Back_button', 'Home_nav_button', 'List_link_button']} history={this.props.history} avatar={avatar} login={this.props.userInfo.ID} />
                </header> 
                <div className='content'>
                    <div className="layout-container">
            
                <h6 className="create-list-heading">Create a new list by filling out the form below</h6>
                <form onSubmit={handleSubmit(this.userCreateListData)}>
                    <Field name="eventName" label="Event Name" component={ this.renderInput } placeholder={"eg. Birthday Party"} />
                    <Field name="eventDescription" label="Event Description" component={ this.renderTextArea }
                    caption="Enter some details about your event like where to park or how to get there."
                    placeholder={"eg. Park on the street"}/>

                    <div className="form-row">
                        <div className="form-col">
                            <fieldset className="date-fieldset">
                                <legend className="form-input-label date-input-label">Enter Date and Time</legend>
                                    <div>
                                        <DatePicker sendDate={this.getDate} /><span className="date-note"> ◄ Select date</span>
                                    </div>
                            </fieldset>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col create-list-right">
                            <SignInModal isOpen={this.state.modalStatus} close={this.close} />
                            <button className={saved ? "btn btn-saved" : "btn btn-green"}>{saved ? "✔️ Saved" : "Next"}</button>
                            {saved ? <Redirect to={`/list/${this.props.url}`}/> : null}
                        </div>
                    </div>
                </form>
        
                </div>
                </div>
                <footer>
                    <Footer buttons={[]} />
                </footer>
            </div>
        )
    }
}

function validate(values){
    const { eventName, eventDateInput, eventDescription } = values;
    const errors = {};
    let eventNameCharCount = 0;
    let eventDescriptionCharCount = 0;

    eventNameCharCount = eventName.length;
    eventDescriptionCharCount = eventDescription.length;

    if(eventNameCharCount > 80) {
        errors.eventName = "Please enter 80 characters or less";
    }

    if(eventDescriptionCharCount > 250) {
        errors.eventDescription = "Please enter 250 characters or less";
        console.log(eventDescriptionCharCount);
    }

    if(!eventName){
        errors.eventName = "Please enter a name for your event";
    }
    if(!eventDateInput){
        errors.eventDateInput = 'Please select the date of your event';
    }

    return errors;
}

function mapStateToProps(state, props){
    return {
        url: state.list.url,
        userInfo: state.user.userInfo
    }
}

CreateList = reduxForm({
    form: 'create_list_data',
    validate: validate,
    initialValues: {
        eventName: localStorage.getItem('eventName') || '',
        eventDescription: localStorage.getItem('eventDescription') || ''
    }
})(CreateList);

export default connect(mapStateToProps,{
    createListData, authenticate
})(CreateList); 