<?php
/*
 * Script que ejecuta el backup de la BD
 */
class backupBD {
    public function __construct() {
        $this->backup();
    }
    private function backup()
    {
        $hoy=  date('Ymd');
        exec("mysqldump --user=root --password=1234 --host=localhost CFDI > /path/to/output/$hoy.sql");        
    }
}
$backup=new backupBD();
?>
