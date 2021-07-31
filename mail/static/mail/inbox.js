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
  document.querySelector('#read-view').style.display = 'none';
  document.querySelector('#reply-view').style.display = 'none';
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
  document.querySelector('#read-view').style.display = 'none';
  document.querySelector('#reply-view').style.display = 'none';
 
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Call fetch_email function
  fetch_mailbox(mailbox);
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
    // Each email contained in a div
    var div = document.createElement('div');
    div.id = 'mail-element';
    div.setAttribute('onclick', `read_email(${element.id})`);
    // Sender
    var sender = document.createElement('h5');
    var sender_text = document.createTextNode(`${element.sender}`);
    sender.appendChild(sender_text);
    // Subject
    var subject = document.createElement('p');
    var subject_text = document.createTextNode(`${element.subject}`);
    subject.appendChild(subject_text);
    // Timestamp
    var timestamp = document.createElement('p');
    var timestamp_text = document.createTextNode(`${element.timestamp}`);
    timestamp.style.color = 'grey';
    timestamp.appendChild(timestamp_text);
    // Append Sender, Subject and Button into 'div'
    div.appendChild(sender);
    div.appendChild(subject);
    div.appendChild(timestamp);
    // Append into 'emails-view'
    document.getElementById('emails-view').appendChild(div);
  }
}

function read_email(identifier) {
  // Fetch email id
  fetch(`emails/${identifier}`)
  .then(response => response.json())
  .then(email => {
    document.querySelector('#from').innerHTML = `<h5>From: ${email.sender}</h5>`;
    document.querySelector('#to').innerHTML = `<h5>To: ${email.recipients}</h5>`;
    document.querySelector('#subject').innerHTML = `<h5>Subject: ${email.subject}</h5>`;
    document.querySelector('#timestamp').innerHTML = `<p style="color: grey;">${email.timestamp}</p>`
    document.querySelector('#body').innerHTML = `<p>${email.body}</p>`;
    // Reply email button
    var reply_element = document.querySelector('#reply');
    reply_element.setAttribute('onclick', `reply_email(${identifier})`);
    // Archive / Unarchive email button
    var archive_element = document.querySelector('#archive');
    var unarchive_element = document.querySelector('#unarchive');
    // Archive / Unarchive button does not apply for sent emails
    if (email.sender != document.getElementById('logged-user').innerHTML) {
      if (!email.archived) {
        archive_element.style.display = 'inline-block';
        unarchive_element.style.display = 'none';
        archive_element.setAttribute('onclick', `archive_email(${identifier})`);
      }
      else {
        archive_element.style.display = 'none';
        unarchive_element.style.display = 'inline-block';
        unarchive_element.setAttribute('onclick', `unarchive_email(${identifier})`);
      }
    }
    else {
      archive_element.style.display = 'none';
      unarchive_element.style.display = 'none';
    }
  });
  // Set read to true once email is clicked
  fetch(`emails/${identifier}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true,
    })
  })
  
  // Show read-email view and hide the other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#reply-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'block';
}

function reply_email(identifier) {

  fetch(`emails/${identifier}`)
  .then(response => response.json())
  .then(email => {
    // Pre-fill the fields with data
    document.querySelector('#reply-recipients').value = email.sender;
    if ((email.subject).includes("RE: ")) {
      document.querySelector('#reply-subject').value = email.subject;
    }
    else {
      document.querySelector('#reply-subject').value = `RE: ${email.subject}`;
    }
    document.querySelector('#reply-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
    document.querySelector('#reply-recipients').disabled = true;
    document.querySelector('#reply-subject').disabled = true;
    document.querySelector('#reply-body').disabled = true;
    // Empty Editable Field
    document.querySelector('#reply-body-editable').value = '';
  });

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#reply-view').style.display = 'block';

  // Upon an 'on-submit' event, query the FORM to be submitted
  document.querySelector('#reply-form').addEventListener('submit', () => reply_email_submit());
}

function reply_email_submit() {
  // Upload the field data as JSON
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#reply-recipients').value,
      subject: document.querySelector('#reply-subject').value,
      body: document.querySelector('#reply-body-editable').value
    })
  })
}

// Archive emails in Inbox
function archive_email(identifier) {
  fetch(`/emails/${identifier}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  });
  // Load inbox
  load_mailbox('inbox');
}

// Unarchive emails in Inbox
function unarchive_email(identifier) {
  fetch(`/emails/${identifier}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  });
  // Load inbox
  load_mailbox('archive');
}