<?php

class API 
{
    
    // Check if we have a session key
    static public function sessionIsValid()
    {
        try {
            $ret = false;

            session_start();

            // TODO: Make sure this is correct
            if (isset($_SESSION) && $_SESSION['sessionkey']) {
                $ret = true;

                // Update last activity time stamp
                $_SESSION['LAST_ACTIVITY'] = time();
            } else {
                session_unset();
                session_destroy();
            }

            return $ret;
        } catch (Exception $e) {
            return false;
        }
    }


    // Log in and return the session key
    public function login($username,$password,$apikey,$hostname)
    {
        $url = 'http://api2.mediasilo.com/';
        $postFields = 'returnformat=json&method=user.login&username=' . $username . '&password=' . $password . '&apikey=' . $apikey . '&hostname=' . $hostname;

        $ch = curl_init($url . '?' . $postFields);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        try {
            $response = json_decode($response);
        } catch (exception $e) {
            // Utils::log($e);
        }

        return $response;
    }


    // Gateway call to MediaSilo API   
    public function proxycall()
    {
        
        $url = 'http://api2.mediasilo.com/';
        $postFields = "returnformat=json&session={$_SESSION['sessionkey']}";

        foreach ($_REQUEST as $name => $value) {
            if ($name == 'proxycall') {
                continue;
            } else if (in_array($value, $_COOKIE)) { // We don't want cookie values, only those in $_GET and $_POST
                continue;
            } else if ($name == 'method') {
                continue;
            } else if ($name == 'parameters') {
                $postFields .= '&method=' . $value;
            } else {
                $postFields .= '&' . $name . '=' . $value;
            }
        }

        // Consider making this a POST request to handle larger volume of assets returns
        $url = $url . '?' . $postFields;
        $url = str_replace(' ', '%20', $url);

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, false);

        $response = curl_exec($ch);
        curl_close($ch);

        try {
            $response = json_decode($response);
        } catch (exception $e) {
            Utils::log($e);
        }

        return $response;
    }

    
}