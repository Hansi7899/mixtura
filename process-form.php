<?php
<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $name = $_POST['name'];
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    $message = $_POST['message'];
    
    // Email recipient
    $to = "johann7899@gmail.com";
    $subject = "New Message from $name";
    
    // Email content
    $email_content = "Name: $name\n";
    $email_content .= "Email: $email\n";
    $email_content .= "Phone: $phone\n\n";
    $email_content .= "Message:\n$message\n";
    
    // Email headers
    $headers = "From: $email\n";
    $headers .= "Reply-To: $email";
    
    // Send email
    mail($to, $subject, $email_content, $headers);
    
    // Redirect back to contact page with success message
    header("Location: contact.html?status=success");
    exit;
}
?>