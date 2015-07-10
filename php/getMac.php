<?php 
/*
 * Esta clase es llamada desde el archivo alta_sistema.js
 * Devuelve la Mac Address del equipo del cliente que utiliza el sistema.
 */
class getMac
{
    public function __construct() {
        echo $Mac=$this->returnMacAddress();
    }
//    function getMac(){        
//          $output=array();   
//          exec("ipconfig /all", $output);
//          $mac="0";
//         $patron = '/([a-fA-F0-9]{2}[:|\-]?){6}/';
//          foreach($output as $line){
//              $array=  explode(":", $line);
//              $result=end($array);
//              if(strlen($result)==18)
//              {
//                  echo "<p>". $result."</p>";
//                if (preg_match($patron,$result)){
//                        $mac=$result;
//                        echo "***************Valid mac address****************";
//                    }
//              }              
//          }
//          return $mac;    
//      }
      
      function returnMacAddress() { 
        // Get the arp executable path
        $location = `which arp`;
        // Execute the arp command and store the output in $arpTable
        $arpTable = `$location`;
        // Split the output so every line is an entry of the $arpSplitted array
        $arpSplitted = split("\n",$arpTable);
        // Get the remote ip address (the ip address of the client, the browser)
        $remoteIp = $GLOBALS['REMOTE_ADDR'];
        // Cicle the array to find the match with the remote ip address
        foreach ($arpSplitted as $value) {
        // Split every arp line, this is done in case the format of the arp
        // command output is a bit different than expected
        $valueSplitted = split(" ",$value);
        foreach ($valueSplitted as $spLine) {
        if (preg_match("/$remoteIp/",$spLine)) {
        $ipFound = true;
        }
        // The ip address has been found, now rescan all the string
        // to get the mac address
        if ($ipFound)
            {
            // Rescan all the string, in case the mac address, in the string
            // returned by arp, comes before the ip address
            reset($valueSplitted);
            foreach ($valueSplitted as $spLine)
                {
                    if (preg_match("/[0-9a-f][0-9a-f][:-]".
                    "[0-9a-f][0-9a-f][:-]".
                    "[0-9a-f][0-9a-f][:-]".
                    "[0-9a-f][0-9a-f][:-]".
                    "[0-9a-f][0-9a-f][:-]".
                    "[0-9a-f][0-9a-f]/i",$spLine))
                    {
                        return $spLine;
                    }
                }
             }
        $ipFound = false;
        }
        }
        return false;
        }
}
$getMac=new getMac();
//$mac = trim($mac);
?>
