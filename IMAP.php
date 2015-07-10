<?php
/* connect to gmail */
$hostname = '{imap.gmail.com:993/imap/ssl/novalidate-cert}';
$username = 'danielbyko@gmail.com';
$password = 'Dan13llg';

/* try to connect */
$inbox = imap_open($hostname,$username,$password) or die('Cannot connect to Gmail: ' . imap_last_error());

/* grab emails */
$emails = imap_num_msg($inbox);



/* if emails are returned, cycle through each... */
if($emails) {

  /* begin output var */
  $output = '';

  /* put the newest emails on top */
//  rsort($emails);

    for ($jk = 1; $jk <= imap_num_msg($inbox); $jk++)
    {

    /* get information specific to this email */
    $overview = imap_fetch_overview($inbox,$jk,0);
    $message = imap_fetchbody($inbox,$jk,2);
    $structure = imap_fetchstructure($inbox,$jk);

     $attachments = array();
       if(isset($structure->parts) && count($structure->parts)) {
         for($i = 1; $i < count($structure->parts); $i++) 
         {
             /* Se ignoran otros formatos que no sean XML y PDF */
             if(!($structure->parts[$i]->subtype=="xml" or $structure->parts[$i]->subtype=="pdf" or $structure->parts[$i]->subtype=="XML" or $structure->parts[$i]->subtype=="PDF"))
                 continue;
             
             
           $attachments[$i] = array(
              'is_attachment' => false,
              'filename' => '',
              'name' => '',
              'attachment' => '');

           if($structure->parts[$i]->ifdparameters) {
             foreach($structure->parts[$i]->dparameters as $object) {
               if(strtolower($object->attribute) == 'filename') {
                 $attachments[$i]['is_attachment'] = true;
                 $attachments[$i]['filename'] = $object->value;
               }
             }
           }

           if($structure->parts[$i]->ifparameters) {
             foreach($structure->parts[$i]->parameters as $object) {
               if(strtolower($object->attribute) == 'name') {
                 $attachments[$i]['is_attachment'] = true;
                 $attachments[$i]['name'] = $object->value;
               }
             }
           }

           if($attachments[$i]['is_attachment']) {
             $attachments[$i]['attachment'] = imap_fetchbody($inbox, $jk, $i+1);
             if($structure->parts[$i]->encoding == 3) { // 3 = BASE64
               $attachments[$i]['attachment'] = base64_decode($attachments[$i]['attachment']);
             }
             elseif($structure->parts[$i]->encoding == 4) { // 4 = QUOTED-PRINTABLE
               $attachments[$i]['attachment'] = quoted_printable_decode($attachments[$i]['attachment']);
             }
           }      
           $filename=$structure->parts[$i]->dparameters[0]->value;
           echo "<p>nombre= $filename extension =". $structure->parts[$i]->subtype ."<p>";
           
           /* Se obtiene el emisor */
           $result = imap_fetch_overview($inbox,$jk);          
            $regexp = '/([a-z0-9_\.\-])+\@(([a-z0-9\-])+\.)+([a-z0-9]{2,4})+/i';

            preg_match_all($regexp, $result[0]->from, $m,PREG_PATTERN_ORDER);
            $date = new DateTime($result[0]->date);
           
            echo "<p> ".$correo_emisor=$m[0][0]." extension=".  $structure->parts[$i]->subtype." hora de recibo=".$date->format('Y-m-d-H-i-s')."</p>";

            /* Se almacena el adjunto */
            foreach($attachments as $at)
            {
                if($at['is_attachment']==1)
                {
                    file_put_contents($at['filename'], $at['attachment']);
                }
            }        
           
           
         } // for($i = 0; $i < count($structure->parts); $i++)
       } // if(isset($structure->parts) && count($structure->parts))

       
       
  }

 // echo $output;
} 

/* close the connection */
imap_close($inbox);

?>