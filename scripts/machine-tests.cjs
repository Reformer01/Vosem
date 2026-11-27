const assert = require('assert');
const path = require('path');

const build = path.join(__dirname, '..', '.test-build');
const load = (file) => require(path.join(build, file));
const { authSessionMachine, loginMachine, signupMachine } = load('auth.machine.js');
const { givingMachine, paymentVerificationMachine } = load('payment.machine.js');
const { testimonySubmissionMachine } = load('content.machine.js');
const { prayerSubmissionMachine } = load('prayer-submission.machine.js');
const { sessionGuardMachine } = load('session.machine.js');
const { dataLoadMachine } = load('data-load.machine.js');
const {
  adminMachine, adminCrudMachine, confirmDeleteMachine,
  dashboardDataMachine, formMachine,
} = load('app.machine.js');

const checks = [
  [authSessionMachine, 'loading', 'SIGNED_IN', 'authenticated'],
  [loginMachine, 'submitting', 'SUCCESS', 'redirecting'],
  [signupMachine, 'creating-profile', 'PROFILE_SAVED', 'redirecting'],
  [givingMachine, 'open', 'PROCEED_PAYSTACK', 'paying-paystack'],
  [paymentVerificationMachine, 'verifying', 'API_SUCCESS', 'succeeded'],
  [testimonySubmissionMachine, 'submitting', 'FAILURE', 'error'],
  [prayerSubmissionMachine, 'idle', 'SUBMIT', 'submitting'],
  [sessionGuardMachine, 'checking', 'VALID', 'valid'],
  [dataLoadMachine, 'loading', 'DATA', 'data'],
  [adminMachine, 'loading-role', 'ROLE_OTHER', 'not-admin'],
  [adminCrudMachine, 'deleting', 'SUCCESS', 'success'],
  [confirmDeleteMachine, 'confirming', 'CONFIRM', 'deleting'],
  [dashboardDataMachine, 'data-loading', 'DATA_ERROR', 'error'],
  [formMachine, 'submitting', 'FAILURE', 'error'],
];

for (const [machine, from, event, to] of checks) {
  assert.strictEqual(machine.transition(from, event), to, `${machine.id}: ${from} --${event}--> ${to}`);
}
for (const [machine, from, event] of checks) {
  assert.strictEqual(machine.transition(from, 'UNKNOWN_EVENT'), from, `${machine.id} should ignore unknown events`);
}
console.log(`${checks.length} machine transitions and unknown-event no-ops verified`);
