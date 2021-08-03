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
  // Call fetch_email function
  fetch_mailbox(mailbox);
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';
  document.querySelector('#reply-view').style.display = 'none';
 
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
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
  // Load sent mailbox
  load_mailbox('sent');
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
    // Sender
    var sender = document.createElement('h5');
    sender.id = 'mail-sender';
    var sender_text = document.createTextNode(`${element.sender}`);
    sender.appendChild(sender_text);
    sender.setAttribute('onclick', `read_email(${element.id})`);
    // Subject
    var subject = document.createElement('p');
    subject.id = 'mail-subject';
    var subject_text = document.createTextNode(`${element.subject}`);
    subject.appendChild(subject_text);
    subject.setAttribute('onclick', `read_email(${element.id})`);
    // Timestamp
    var timestamp = document.createElement('p');
    timestamp.id = 'mail-timestamp';
    var timestamp_text = document.createTextNode(`${element.timestamp}`);
    timestamp.appendChild(timestamp_text);
    // Append Sender, Subject, Timestamp into 'div'
    div.appendChild(sender);
    div.appendChild(subject);
    div.appendChild(timestamp);
    if (element.sender != document.getElementById('logged-user').innerHTML) {
      if (!element.archived) {
        // For user's inbox
        // Reply
        var reply = document.createElement('div');
        reply.className = 'reply';
        reply.setAttribute('onclick', `reply_email(${element.id})`);
        var reply_icon = document.createElement('i');
        var reply_text = document.createElement('p');
        reply_text.innerHTML = 'Reply';
        reply_text.className = 'annotation';
        reply_icon.className = 'fas fa-reply';
        reply.appendChild(reply_icon);
        reply.appendChild(reply_text);
        // Archive
        var archive = document.createElement('div');
        archive.className = 'archive';
        archive.setAttribute('onclick', `archive_email(${element.id})`);
        var archive_icon = document.createElement('i');
        var archive_text = document.createElement('p');
        archive_text.innerHTML = 'Archive';
        archive_text.className = 'annotation';
        archive_icon.className = 'fas fa-trash';
        archive.appendChild(archive_icon);
        archive.appendChild(archive_text);
        // Append
        div.appendChild(reply);
        div.appendChild(archive);
        if (element.read) {
          // Unread
          var unread = document.createElement('div');
          unread.className = 'unread';
          unread.setAttribute('onclick', `unread_email(${element.id})`);
          var unread_icon = document.createElement('i');
          var unread_text = document.createElement('p');
          unread_text.innerHTML = 'Mark as Unread';
          unread_text.className = 'annotation';
          unread_icon.className = 'fa fa-envelope';
          unread.appendChild(unread_icon);
          unread.appendChild(unread_text);
          div.appendChild(unread);
        }
      }
      else {
        // User's archived mails
        // Archived emails can only be unarchived
        var unarchive = document.createElement('div');
        unarchive.className = 'unarchive';
        unarchive.setAttribute('onclick', `unarchive_email(${element.id})`);
        var unarchive_icon = document.createElement('i');
        var unarchive_text = document.createElement('p');
        unarchive_text.innerHTML = 'Unarchive';
        unarchive_text.className = 'annotation';
        unarchive_icon.className = 'fas fa-trash-restore';
        unarchive.appendChild(unarchive_icon);
        unarchive.appendChild(unarchive_text);
        // Append
        div.appendChild(unarchive);
      }
    }
    else {
      // User's sent mails
      // Sent emails can only be replied, not marked as unread or archived
      var reply = document.createElement('div');
      reply.className = 'reply';
      reply.setAttribute('onclick', `reply_email(${element.id})`);
      var reply_icon = document.createElement('i');
      var reply_text = document.createElement('p');
      reply_text.innerHTML = 'Reply';
      reply_text.className = 'annotation';
      reply_icon.className = 'fas fa-reply';
      reply.appendChild(reply_icon);
      reply.appendChild(reply_text);
      // Append
      div.appendChild(reply);
    }
    // Append into 'emails-view'
    document.getElementById('emails-view').appendChild(div);
    // Show different style if email is not yet read
    if (!element.read) {
      sender.style.fontWeight = '800';
      subject.style.fontWeight = '800';
    }
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
    reply_element.style.display = 'inline-block';
    reply_element.setAttribute('onclick', `reply_email(${identifier})`);
    // Archive / Unarchive email button
    var archive_element = document.querySelector('#archive');
    var unarchive_element = document.querySelector('#unarchive');
    // Unread button (Hidden initially)
    var unread_element = document.querySelector('#unread');
    unread_element.style.display = 'none';
    // Archive / Unarchive button does not apply for sent emails
    if (email.sender != document.getElementById('logged-user').innerHTML) {
      // If email not archived
      if (!email.archived) {
        archive_element.style.display = 'inline-block';
        unarchive_element.style.display = 'none';
        archive_element.setAttribute('onclick', `archive_email(${identifier})`);
        // Display unread button
        unread_element.style.display = 'inline-block';
        unread_element.setAttribute('onclick', `unread_email(${identifier})`);
      }
      else {
        archive_element.style.display = 'none';
        unarchive_element.style.display = 'inline-block';
        unarchive_element.setAttribute('onclick', `unarchive_email(${identifier})`);
        reply_element.style.display = 'none';
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
    // Disable the pre-filled fields
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
  // Load inbox (Set timeout is used to delay the loading, to allow the database to update first.)
  setTimeout(() => {
    load_mailbox('inbox');
  }, 100);
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
  setTimeout(() => {
    load_mailbox('inbox');
  }, 100);
}

// Function to "unread" email
function unread_email(identifier) {
  fetch(`emails/${identifier}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: false,
    })
  })
  // Load inbox
  setTimeout(() => {
    load_mailbox('inbox');
  }, 100);
}