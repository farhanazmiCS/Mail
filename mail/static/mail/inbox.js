document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Upon an 'on-submit' event, query the FORM to be submitted
  document.querySelector('#compose-form').addEventListener('submit', () => send_email());
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
 
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Call fetch_email function
  fetch_mailbox(mailbox);
}

function view_email(id) {
  // Show the email and hide other views
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  fetch_email(id);

}

function send_email() {

  // Upload the field data as JSON
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
}

function fetch_mailbox(mailbox) {
  
  // Fetch mail from the respective mailboxes
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(email => {
    email.forEach(loop)
  });
  
  function loop(element) {
    // Get id of element
    var id = element.id
    // Each email contained in a div
    var div = document.createElement('div');
    div.id = 'mail-element';
    var a = document.createElement('a');
    a.href = `/emails/${id}`
    // Sender
    var sender = document.createElement('h5');
    var sender_text = document.createTextNode(`${element.sender}`);
    sender.appendChild(sender_text);
    // Subject
    var subject = document.createElement('p');
    var subject_text = document.createTextNode(`${element.subject}`);
    subject.appendChild(subject_text);
    // Append Sender, Subject and Body into 'div'
    div.appendChild(sender);
    div.appendChild(subject);
    // Append into 'emails-view'
    document.getElementById('emails-view').appendChild(div);
  }
}

function fetch_email(id) {
  fetch(`emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Create Div Element
    document.createElement('div');
    // Create 'From' Element
    var from = document.createElement('h5');
    from.id = 'from';
    var from_item = `From: ${email.sender}`;
    from.appendChild(from_item)
    // Create 'To' Element
    var to = document.createElement('h5');
    to.id = 'to';
    var to_item = `To: ${email.recipients[0]}`
    to.appendChild(to_item);
    // Create 'Subject' Element
    var subject = document.createElement('h5');
    subject.id = 'subject';
    var subject_item = `Subject: ${email.subject}`;
    subject.appendChild(subject_item);
    // Append to div
    div.appendChild(from);
    div.appendChild(to);
    div.appendChild(subject);
    // Append to email-view
    document.getElementById('email-view').appendChild(div);
  })
}