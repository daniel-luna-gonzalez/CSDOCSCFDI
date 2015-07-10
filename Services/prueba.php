<?php

$time = date("G:i:s");
$entry = "Información guardada a las $time.\n";
$file = "/usr/CFDI/LOGcsvtxt.txt";
$open = fopen($file,"a");
if ( $open ) {
    fwrite($open,$entry);
    fclose($open);
}
