<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST["email"];

    $apiKey = "YOUR_API_KEY";
    $groupId = "YOUR_GROUP_ID"; // from MailerLite Groups

    $ch = curl_init("https://connect.mailerlite.com/api/subscribers");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json",
        "Authorization: Bearer $apiKey"
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        "email" => $email,
        "groups" => [$groupId]
    ]));

    $response = curl_exec($ch);
    curl_close($ch);

    echo "Thanks for subscribing!";
}
?>
