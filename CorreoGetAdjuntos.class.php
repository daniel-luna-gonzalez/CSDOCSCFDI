<?php
class CorreoGetAdjuntos
{
	
    function getdecodevalue($message,$coding)
    {
        switch($coding) 
        {
            case 0:
            case 1:
                    $message = imap_8bit($message);
                    break;
            case 2:
                    $message = imap_binary($message);
                    break;
            case 3:
            case 5:
            case 6:
            case 7:
                    $message=imap_base64($message);
                    break;
            case 4:
                    $message = imap_qprint($message);
                    break;
        }
        return $message;
    }

    function getdata($host,$login,$password,$savedirpath)
    {
    $mbox = imap_open ($host,  $login, $password) or die("can't connect: " . imap_last_error());
    $message = array();
    $message["attachment"]["type"][0] = "text";
    $message["attachment"]["type"][1] = "multipart";
    $message["attachment"]["type"][2] = "message";
    $message["attachment"]["type"][3] = "application";
    $message["attachment"]["type"][4] = "audio";
    $message["attachment"]["type"][5] = "image";
    $message["attachment"]["type"][6] = "video";
    $message["attachment"]["type"][7] = "other";

    $buzon_destino = "cfdi";

   echo imap_createmailbox($mbox, imap_utf7_encode("$buzon_destino"));
    echo imap_num_msg($mbox);
    
    for ($jk = 1; $jk <= imap_num_msg($mbox); $jk++)
        {
        $structure = imap_fetchstructure($mbox, $jk );    
        $parts = $structure->parts;
        $fpos=2;
        for($i = 1; $i < count($parts); $i++)
           {
            $message["pid"][$i] = ($i);
            $part = $parts[$i];

            if(strtolower($part->disposition) == "attachment") 
                {
                    $message["type"][$i] = $message["attachment"]["type"][$part->type] . "/" . strtolower($part->subtype);
                    $message["subtype"][$i] = strtolower($part->subtype);
                    $ext=$part->subtype;                                            
                    $params = $part->dparameters;
                    $filename=$part->dparameters[0]->value;                                        
                    
                    if(!($ext=='xml' or $ext=='XML' or $ext=='PDF' or $ext=='pdf'))
                    {
                        continue;
                    }
                    
                    $mege="";
                    $data="";
                    $mege = imap_fetchbody($mbox,$jk,$fpos);  

                    $data=$this->getdecodevalue($mege,$part->type);
                    $fp=fopen($filename,'w');
                    fputs($fp,$data);
                    fclose($fp);
                    $fpos+=1; 
                    
                    /* Se mueve el archiv descargado al directorio de recibidos */
//                    rename($filename, $savedirpath.$filename);
//                    printf("\nSe movio el archivo $filename");
                }
                
                
            }
            
            

                $result = imap_fetch_overview($mbox,$jk);
                echo $result[0]->from;

            
//            imap_mail_move($mbox, $jk, $buzon_destino);
//imap_delete tags a message for deletion
//    imap_delete($mbox,$jk);

        }
// imap_expunge deletes all tagged messages
//                    imap_expunge($mbox);
                    imap_close($mbox);
    }    
}


?>
