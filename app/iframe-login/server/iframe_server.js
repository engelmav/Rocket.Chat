import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import { OAuth } from 'meteor/oauth';

Accounts.registerLoginHandler('iframe', function (result) {
  if (!result.iframe) {
    return;
  }

  check(result.token, String);

  console.log('[Method] registerLoginHandler');

  const user = Meteor.users.findOne({
    'services.iframe.token': result.token,
  });

  if (user) {
    return {
      userId: user._id,
    };
  }
});

Accounts.registerLoginHandler('iframeTokenParam', function (result) {
  if (!result.iframeTokenParam) {
    return;
  }

  let hashedTokenProvided = Accounts._hashLoginToken(result.token);
  let authedUser = Meteor.users.findOne({
    "services.resume.loginTokens": { $elemMatch: { "hashedToken": hashedTokenProvided } }
  });
  debugger;
  if (authedUser) {
    return {
      userId: authedUser._id
    };
  }
});


Meteor.methods({
  'OAuth.retrieveCredential'(credentialToken, credentialSecret) {
    return OAuth.retrieveCredential(credentialToken, credentialSecret);
  },
});
