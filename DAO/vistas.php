<?php
include '/volume1/web/DAO/Querys.php';
class vistas {
    public function __construct() {
        $this->build_view();
    }
    private function build_view()
    {
        $clase_query=new Querys();
        $conexion=$clase_query->Conexion();
        mysql_select_db('CFDI',$conexion);
        $q="CREATE OR REPLACE VIEW insert_pdf As select id_detalle,nombre from registro_xml inner join registro_pdf on nombre_xml=nombre";
        $consulta=  mysql_query($q);
        if(!$consulta)
        {
            echo "Error en la consulta $consulta   error  ".mysql_error();
        }
        else
        {
            "VISTA";
        }
        mysql_close($conexion);
    }
}

$vistas=new vistas();

?>
