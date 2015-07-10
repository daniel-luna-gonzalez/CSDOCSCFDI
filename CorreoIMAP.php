<?php
require_once("CorreoGetAdjuntos.class.php");
$host="{imap.gmail.com:993/imap/ssl/novalidate-cert}"; // pop3host
$login="danielbyko@gmail.com"; //pop3 login
$password="Dan13llg"; //pop3 password
$savedirpath="/volume1/web/correoCFDI/extraidos/" ; // attachement will save in same directory where scripts run othrwise give abs path
$jk=new CorreoGetAdjuntos(); // Creating instance of class####
$jk->getdata($host,$login,$password,$savedirpath); // calling member function
?>