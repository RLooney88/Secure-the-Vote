/**
 * Email Templates Index
 * 
 * Exports all email templates for easy importing.
 */

const verificationEmail = require('./verification');
const petitionConfirmation = require('./petition-confirmation');
const commentAlert = require('./comment-alert');
const welcomeAdmin = require('./welcome');
const petitionUpdate = require('./petition-update');

module.exports = {
  verificationEmail,
  petitionConfirmation,
  commentAlert,
  welcomeAdmin,
  petitionUpdate
};