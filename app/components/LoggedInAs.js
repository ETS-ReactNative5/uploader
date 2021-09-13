/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { remote } from 'electron';
const i18n = remote.getGlobal( 'i18n' );
import personUtils from '../../lib/core/personUtils';

import ListIcon from '@material-ui/icons/List';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import BusinessIcon from '@material-ui/icons/Business';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import styles from '../../styles/components/LoggedInAs.module.less';

export default class LoggedInAs extends Component {
  static propTypes = {
    dropMenu: PropTypes.bool.isRequired,
    isUploadInProgress: PropTypes.bool.isRequired,
    onCheckForUpdates: PropTypes.func.isRequired,
    onChooseDevices: PropTypes.func.isRequired,
    onClicked: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
    user: PropTypes.object,
    isClinicAccount: PropTypes.bool,
    targetUsersForUpload: PropTypes.array,
    clinics: PropTypes.object,
    hasPersonalWorkspace: PropTypes.bool,
    onWorkspaceSwitch: PropTypes.func.isRequired,
    goToPersonalWorkspace: PropTypes.func.isRequired,
    switchToClinic: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = { loggingOut: false };
  }

  noopHandler(e) {
    if (e) {
      e.preventDefault();
    }
  }

  handleChooseDevices = e => {
    e.preventDefault();
    this.props.onChooseDevices();
  };

  handleCheckForUpdates = e => {
    e.preventDefault();
    this.props.onCheckForUpdates();
    ipcRenderer.send('autoUpdater','checkForUpdates');
  };

  handleLogout = e => {
    e.preventDefault();
    this.setState({
      loggingOut: true
    });
    var self = this;
    this.props.onLogout(function(err) {
      if (err) {
        self.setState({
          loggingOut: false
        });
      }
    });
  };

  handleWorkspaces = e => {
    e.preventDefault();
    this.props.onWorkspaceSwitch();
  };

  handleSwitchToPersonal = e => {
    e.preventDefault();
    this.props.goToPersonalWorkspace();
  }

  handleSwitchToClinic = clinic => {
    this.props.switchToClinic(clinic);
  }

  renderChooseDevices() {
    var title = '';
    var uploadInProgress = this.props.isUploadInProgress;
    var isDisabled = uploadInProgress;


    if (_.isEmpty(this.props.targetUsersForUpload) && !this.props.hasPersonalWorkspace) {
     isDisabled = true;
    }


    if (uploadInProgress) {
      title = i18n.t('Upload in progress!\nPlease wait to change device selection.');
    } else if (isDisabled) {
      title = i18n.t('Set up data storage to upload devices.');
    }

    return (
      <li>
        <a className={styles.link}
          disabled={isDisabled}
          href=""
          onClick={isDisabled ? this.noopHandler : this.handleChooseDevices}
          title={title}>
          <i className={styles.editIcon}></i>
          {i18n.t('Choose Devices')}
        </a>
      </li>
    );
  }

  renderCheckForUpdates() {
    return (
      <li>
        <a className={styles.link}
          onClick={this.handleCheckForUpdates}
          href=""
          title={i18n.t('Check for Updates')}>
          <i className={styles.updateIcon}></i>
          {i18n.t('Check for Updates')}
        </a>
      </li>
    );
  }

  renderWorkspaces() {
    var {clinics, hasPersonalWorkspace} = this.props;
    var clinicIds = _.keys(clinics);
    if(clinicIds.length > 1){
      return (
        <li>
          <a className={styles.muiLink}
          onClick={this.handleWorkspaces}
          href=""
          title={i18n.t('Change Workspace')}>
            <ListIcon classes={{root:styles.workspaceSwitchIcon}} fontSize='inherit'/>
            {i18n.t('Change Workspace')}
          </a>
        </li>
      );
    }
    if(clinicIds.length == 1 && hasPersonalWorkspace){
      return (
        <li>
          <a className={styles.muiLink}
          onClick={(e) => {
            e.preventDefault();
            this.handleSwitchToClinic(clinics[clinicIds[0]]);
          }}
          href=""
          title={clinics[clinicIds[0]].name}>
            <BusinessIcon classes={{root:styles.workspaceSwitchIcon}} fontSize='inherit'/>
            {clinics[clinicIds[0]].name}
          </a>
        </li>
      );
    }
  }

  renderPersonalWorkspace() {
    var {hasPersonalWorkspace} = this.props;
    if(hasPersonalWorkspace) {
      return (
        <li>
          <a className={styles.muiLink}
            onClick={this.handleSwitchToPersonal}
            href=""
            title={i18n.t('Personal Workspace')}>
              <SupervisedUserCircleIcon classes={{root:styles.personalWorkspaceIcon}} fontSize='inherit' />
              {i18n.t('Personal Workspace')}
            </a>
        </li>
      );
    }
  }

  renderLogout() {
    var uploadInProgress = this.props.isUploadInProgress;

    if (this.state.loggingOut) {
      return <span className={styles.link}>Logging out...</span>;
    }

    return (
      <a className={styles.link}
        disabled={uploadInProgress}
        href=""
        onClick={uploadInProgress ? this.noopHandler : this.handleLogout}
        title={uploadInProgress ? i18n.t('Upload in progress!\nPlease wait to log out.') : ''}>
        <i className={styles.logoutIcon}></i>
        {i18n.t('Logout')}
      </a>
    );
  }

  renderDropMenu() {
    function stopPropagation(e) {
      e.stopPropagation();
    }
    return (
      <div className={styles.dropdown} onClick={stopPropagation}>
        <ul>
          {this.renderChooseDevices()}
          {this.renderCheckForUpdates()}
          {this.renderWorkspaces()}
          {this.renderPersonalWorkspace()}
          <li>{this.renderLogout()}</li>
        </ul>
      </div>
    );
  }

  render() {
    var dropMenu = this.props.dropMenu ? this.renderDropMenu() : null;
    var {user} = this.props;

    return (
      <div className={styles.wrapper}>
        <div className={styles.main} onClick={this.props.onClicked}>
          <span className={styles.name}>{personUtils.patientFullName(user)}</span>
          <ArrowDropDownIcon />
        </div>
        {dropMenu}
      </div>
    );
  }
}
