<?php

require_once(dirname(__FILE__) . '/config/config.php');


try {
  
    if (isset($_REQUEST['method'])) {
      
        // List of available API calls
        // Can be used to white-list calls

        $apiCalls = array(
            'proxycall',
            'login'
        );

        if (in_array($_REQUEST['method'], $apiCalls)) {
            require_once(dirname(__FILE__) . '/api.php');
   
            $api = new API();
            
            // If you are using a login dialog, call this method to authenticate the user
            // Not used in this example by default but provided as a reference
            if ($_REQUEST['method'] == 'login') {
                
                $response = $api->login(MEDIASILO_USERNAME,MEDIASILO_PASSWORD,MEDIASILO_APIKEY,MEDIASILO_HOSTNAME);
                
                if($response->{'STATUS'} == 'success'){
                    session_start(); 
                    $_SESSION['sessionkey']=$response->{'SESSION'};
                    session_write_close(); 
                } else {
                    // Build error handling here in case login fails
                }
       
            } else {

                // Checks if the PHP session is still valid
                if ($api->sessionIsValid()) {
                
                    $response = call_user_func(array('API', $_REQUEST['method']));
                    
                    // Check if the MediaSilo session key is still valid on the MediaSilo side
                    // If not, re-authenticate with the hard-coded credentials                   
                    if($response->{'CODE'} == '511'){
                        $response = $api->login(MEDIASILO_USERNAME,MEDIASILO_PASSWORD,MEDIASILO_APIKEY,MEDIASILO_HOSTNAME);

                        session_start(); 
                        $_SESSION['sessionkey']=$response->{'SESSION'};
                        session_write_close(); 
                        $response = call_user_func(array('API', $_REQUEST['method']));
                    }
                } else {

                    // Force the login with the pre-set credentials
                    $response = $api->login(MEDIASILO_USERNAME,MEDIASILO_PASSWORD,MEDIASILO_APIKEY,MEDIASILO_HOSTNAME);

                    session_start(); 
                    $_SESSION['sessionkey']=$response->{'SESSION'};
                    session_write_close(); 

                    $response = call_user_func(array('API', $_REQUEST['method']));
                }

            }

        } else {
           exit('{"success":false,"message":"Nothing found"}');
        }
    }

    exit(json_encode($response));

} catch (Exception $e) {

    exit('{"success":false,"message":"Invalid API call"}');

}

