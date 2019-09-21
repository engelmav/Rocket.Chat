import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';
import { HTTP } from 'meteor/http';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { settings } from '../../../settings';

export class IframeLogin {
  constructor() {
    this.enabled = false;
    this.reactiveIframeUrl = new ReactiveVar();
    this.reactiveEnabled = new ReactiveVar();
    this.iframeUrl = undefined;
    this.apiUrl = undefined;
    this.apiMethod = undefined;

    Tracker.autorun((c) => {
      this.enabled = settings.get('Accounts_iframe_enabled');
      this.reactiveEnabled.set(this.enabled);

      this.iframeUrl = settings.get('Accounts_iframe_url');
      this.apiUrl = settings.get('Accounts_Iframe_api_url');
      this.apiMethod = settings.get('Accounts_Iframe_api_method');

      if (this.enabled === false) {
        return c.stop();
      }

      if (this.enabled === true && this.iframeUrl && this.apiUrl && this.apiMethod) {
        c.stop();
        if (!Accounts._storedLoginToken()) {
          this.tryLogin(() => { });
        }
      }
    });
  }

  tryLogin(callback) {
    if (!this.enabled) {
      return;
    }

    if (!this.iframeUrl || !this.apiUrl || !this.apiMethod) {
      return;
    }

    console.log('tryLogin');

    let { iframeUrl } = this;
    let separator = '?';
    if (iframeUrl.indexOf('?') > -1) {
      separator = '&';
    }

    console.log('Iframe URL:', iframeUrl);

    if (navigator.userAgent.indexOf('Electron') > -1) {
      iframeUrl += `${separator}client=electron`;
    }

    const authToken = FlowRouter.getQueryParam('authToken');
    if (authToken) {
      debugger;
      console.log(`Authenticating with token`);
      console.log(JSON.stringify(authToken));
      this.loginWithTokenParam(authToken, (error, result) => {
        if (error) {
          console.log(`iframe param token auth failed: ${error}`);
          this.reactiveIframeUrl.set(iframeUrl);
        } else {
          console.log(`iframe param token auth passed:  ${result}`);
          this.reactiveIframeUrl.set();
        }
        callback(error, result);
      });
      return;
    }


    const options = {
      beforeSend: (xhr) => {
        xhr.withCredentials = true;
      },
    };

    HTTP.call(this.apiMethod, this.apiUrl, options, (error, result) => {
      console.log(error, result);
      if (result && result.data && (result.data.token || result.data.loginToken)) {
        this.loginWithToken(result.data, (error, result) => {
          if (error) {
            this.reactiveIframeUrl.set(iframeUrl);
          } else {
            this.reactiveIframeUrl.set();
          }
          callback(error, result);
        });
      } else {
        this.reactiveIframeUrl.set(iframeUrl);
        callback(error, result);
      }
    });
  }

  loginWithToken(tokenData, callback) {
    if (!this.enabled) {
      return;
    }

    if (Match.test(tokenData, String)) {
      tokenData = {
        token: tokenData,
      };
    }

    console.log('loginWithToken');

    if (tokenData.loginToken) {
      return Meteor.loginWithToken(tokenData.loginToken, callback);
    }

    Accounts.callLoginMethod({
      methodArguments: [{
        iframe: true,
        token: tokenData.token,
      }],
      userCallback: callback,
    });
  }

  loginWithTokenParam(token, callback) {
    Accounts.callLoginMethod({
      methodArguments: [{
        iframeTokenParam: true,
        token: token,
      }],
      userCallback: callback,
    });   
  }
}



export const iframeLogin = new IframeLogin();
