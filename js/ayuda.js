/*
 * *****************************************************************************
 *                          Ventana de Ayuda                                   
 *                          
 * 1.- Los temas se van agregando en tablas en el div ventana_ayuda
 * deben de llamarse igual los subtemas y el div que contiene la descripción 
 * a diferencia de que los subtemas  llevan la palabra "subtema_". 
 * esa es la única condición
 * *****************************************************************************
 */

/*  Se insertan en la ventana de ayuda los diferentes temas */
function ventana_ayuda()
{        
//    $("#menu_manual_usuario > div").accordion({ header: "h3", collapsible: true });    
        $('#ventana_ayuda').dialog(
            {
                height: 550,
                width: 900,   
                minHeight:550,
                minWidth:800,
                closeOnEscape:false,
//                resizable: false,
                title:'Ayuda CS-DOCS CFDI'
            }).dialogExtend({
"closable" : true, // enable/disable close button
//"maximizable" : true, // enable/disable maximize button
"minimizable" : true, // enable/disable minimize button
//"collapsable" : true, // enable/disable collapse button
"dblclick" : "collapse", // set action on double click. false, 'maximize', 'minimize', 'collapse'
//"titlebar" : "transparent", // false, 'none', 'transparent'
"minimizeLocation" : "right", // sets alignment of minimized dialogues
"icons" : { // jQuery UI icon class
  "close" : "ui-icon-circle-close",
 // "maximize" : "ui-icon-circle-plus",
  "minimize" : "ui-icon-circle-minus"
  //"collapse" : "ui-icon-triangle-1-s",
  //"restore" : "ui-icon-bullet"
}});          
            
    $("#menu_manual_usuario > div").accordion({ header: "h3", collapsible: true });     
    
    $('#table_menu_ayuda tr').removeClass('celda_seleccionada');/* Se quita la propiedad de selección */
    $("#table_menu_ayuda tr").mouseover(function() {
        if(!$(this).hasClass('celda_seleccionada'))
        $(this).addClass('sobre_celda');
    });
    $("#table_menu_ayuda tr").mouseleave(function() {
        $(this).removeClass('sobre_celda');
    });
    
    $("#table_menu_ayuda tr").click(function(){
        $('#table_menu_ayuda tr').removeClass('celda_seleccionada');
        $(this).removeClass('sobre_celda');
        $(this).addClass('celda_seleccionada');
    });  
      bienvenida_ayuda_csdocs();      
            insert_tems();   
//            $("#menu_manual_usuario").accordion();
}

/* Cuando se pulse sobre un tema se abre deja ver la descripción */

$(document).ready(function(){
    $("#ayuda_caja_busqueda").on("keyup", buscar_ayuda); 
    /* Como el id del subtema es igual que el del div que contiene la descripción 
     * solo contiene la palabra "subtema_" esta se le quita para mandar a llamar 
     * su descripción correspondiente
     * Por ejemplo:  subtema_alta_usuario        Esto va en el HTML ventana_ayuda
     * El div que contiene su descripción debe ser= alta_usuario        Esto va aqui en Javascript */
    $("#table_menu_ayuda tr").click(function() {
        var oID = $(this).attr("id");
        var id_tema=oID.split('');
        var id_tema_='';
        for(cont=8;cont<id_tema.length;cont++)
            {
                id_tema_+=id_tema[cont];
            } 
        $('.buscar_ayuda').css("display","none");
        $('#div_bienvenida_ayuda').empty();/* Se elimina mensaje de ayuda */
        $('#div_bienvenida_ayuda').remove();
        $('#'+id_tema_).css("display","block");
        $('.ayuda_subtitulos').removeClass('celda_seleccionada');
        $(this).addClass('celda_seleccionada');
        });        
    });

/*  Busca dentro del texto cuando el usuario pulsa sobre el form de búsqueda */
function buscar_ayuda(){
$('#table_menu_ayuda tr').removeClass('celda_seleccionada');/* Se quita la propiedad de selección */

    var tarjetas = $(".buscar_ayuda");
    var texto    = $("#ayuda_caja_busqueda").val();
    texto        = texto.toLowerCase();
    tarjetas.show();
    var conta=0;
    $('.buscar_ayuda').css("display","none");
    $('.ayuda_subtitulos').show();
    for(var i=0; i< tarjetas.size(); i++)
    {
        var contenido = tarjetas.eq(i).text();
        contenido     = contenido.toLowerCase();
        var index     = contenido.indexOf(texto);
        if(index == -1)
        {
            tarjetas.eq(i).hide(); 
            conta++;
            var id=tarjetas.eq(i).attr('id');
            var id_subtema='subtema_'+id;
            $('#'+id_subtema).hide();
        }
//                if(conta==tarjetas.size())
//            $('#salida').append(conta+'= oculta tabla<br>');
    }
}
/* Al abrir la ventana de ayuda se muestra esta pantalla */
function bienvenida_ayuda_csdocs()
{
    $('#ayuda_contenido').empty();
    $('#ayuda_contenido').append('<div id="div_bienvenida_ayuda"></div>');
    $('#div_bienvenida_ayuda').append('<div class="titulo_ayuda">Ayuda CSDocs</div>\n\
    <br>\n\
    <center><img src="img/ayuda/help_icon.png" title="help_icon.png" width="150px" heigth="150px"></center>\n\
    <br>\n\
    <p>Gracias por utilizar la ayuda que le proporciona el sistema <b>CSDocs CFDI.</b>\n\
    Cada uno de los temas de ayuda fueron cuidadosamente seleccionados para brindarle\n\
    un mejor servicio y resolver rápidamente cada una de sus dudas sobre el funcionamiento del\n\
    sistema.  </p>\n\
    \n\
    <br><br><img src="img/CSDocs.png" title="CSDOcs" width="200px" heigth="80px" align="right">\n\
');
}
function insert_tems()
{
    /*  Alta Usuario */
    $('#ayuda_contenido').append('<div id="ayuda_alta_usuario" class="buscar_ayuda">\n\
    <div class="titulo_ayuda">Alta de usuario</div>\n\
    <br>\n\
    <p>El administrador tiene la posibilidad de dar de alta a nuevos usuarios para la \n\
    utilización del sistema permitiendole relizar cargas de comprobantes CFDI\n\
    siguiendo unos sencillos pasos:</p>\n\
    <br>\n\
        <p>1. Ir al menú CSDOCS y seleccionar la opción de "Consola de Administración".</p>\n\
        <center><img src="img/ayuda/alta_usuario1.png" class="zoom" title="Alta de usuario"></center>\n\
        <p>2. Pulsar la opción de "Consola de Administración".</p>\n\
        <center><img src="img/ayuda/alta_usuario2.png" title="Alta de usuario"></center>\n\
        <p>3. Llenar los campos requeridos y pulsar el botón de "Agregar Usuario".</p>\n\
    </div>\n\
    ');
    /*  Baja Usuario */
    $('#ayuda_contenido').append('<div id="ayuda_baja_usuario" class="buscar_ayuda">\n\
    <div class="titulo_ayuda">Baja Usuario</div>\n\
    <br>\n\
    <p>Como usuario administrador del sistema tiene los privilegios necesarios para poder dar de \n\
    baja a un usuario registrado y así negar su acceso.</p>\n\
    <br>\n\
    <p>1. Ir al menú CSDOCS y seleccionar la opción de "Consola de Administración".</p>\n\
    <center><img src="img/ayuda/alta_usuario1.png" title="Alta de usuario"></center>\n\
    <p>2. Pulsar la opción de "Consola de Administración".</p>\n\
    <center><img src="img/ayuda/alta_usuario2.png" title="Alta de usuario"></center>\n\
    <p>3. Dirigirse al menú "Usuarios" y seleccionar "Usuarios".</p>\n\
    <center><img src="img/ayuda/baja_usuario1.png"></center>\n\
    <p>4. Una ves visualizado el listado de "Usuarios" con todo su detalle, en la \n\
    columna de "Operaciones" pulsar en el icono de <img src="img/delete_icon.png" title="eliminar usuario" width="22px" heigth="22px">.\n\
    Al realizar está acción el sistema arrojará una ventana de confirmación y se deberá de \n\
    aceptar si se está seguro de dar de baja al usuario. </p>\n\
    </div>');
    
    /* Realizar búsquedas */
    $('#ayuda_contenido').append('<div id="busquedas" class="buscar_ayuda">\n\
    <div class="titulo_ayuda">Búsquedas</div>\n\
    <br>\n\
    <p>El motor de búsqueda de CSDOCS CFDI permite realizar la búsqueda de CFDI\'s utilizando filtros para\n\
    obtener resultados más específicos o realizando una búsqueda global para que arroje todos los resultados.</p>\n\
    </div>');
    
   /*   Modificar Usuario    */ 
   $('#ayuda_contenido').append('<div id="ayuda_modificar_usuario" class="buscar_ayuda">\n\
   <div class="titulo_ayuda">Modificar Usuario</div>\n\
    <br>\n\
    <p>Para realizar modificación de la información de un usuario por ejemplo el cambio\n\
    de su contraseña, esta sección fué diseñada para realizar esos cambios de una manera muy simple.\n\
    </p>\n\
   <br>\n\
    <p>1. Ir al menú CSDOCS y seleccionar la opción de "Consola de Administración".</p>\n\
    <center><img src="img/ayuda/alta_usuario1.png" title="Alta de usuario"></center>\n\
    <p>2. Pulsar la opción de "Consola de Administración".</p>\n\
    <center><img src="img/ayuda/alta_usuario2.png" title="Alta de usuario"></center>\n\
    <p>3. Dirigirse al menú "Usuarios" y seleccionar "Usuarios".</p>\n\
    <center><img src="img/ayuda/baja_usuario1.png"></center>\n\
    <p>4. Una ves visualizado el listado de "Usuarios" con todo su detalle, en la \n\
    columna de "Operaciones" pulsar en el icono de <img src="img/edit_icon.png" title="eliminar usuario" width="22px" heigth="22px">.\n\
    "Editar", se muestra el detalle de la información del usuario que se seleccionó para su\n\
    edición.\n\
    Al término de la modificación de los datos, pulse en el botón finalizar, el sistema mostrará\n\
    un mensaje del estado de la operación si fué éxitosa o si ocurrió algún error. n\
    cierre la ventana.</p>\n\
    </div>');
    
   /* Ingresar un Comprobante */
   $('#ayuda_contenido').append('<div id="ingresar_comprobante" class="buscar_ayuda">\n\
   <div class="titulo_ayuda">Ingresar un Comprobante al sistema</div>\n\
   <br>\n\
    <p>Está es una de las operaciones más importantes que el usuario debe realizar,\n\
    el sistema tiene dos opciones muy sencillaz para realizar esta acción.\n\
    </p>\n\
    <br><p>1. Sobre la interfaz web.</p>\n\
    <br><p>2. Drag and Drop </p>\n\
   <br>\n\
    <p><b>A través de la interfaz</b></p>\n\
    <p>Cada tipo de comprobante tiene su respectivo <b>contenedor</b> por ejemplo, \n\
    no podemos ingresar "Facturas de Proveedor" en el contenedor de "Recios de Nómina".\n\
    </p>\n\
    \n\
    <p>Una vez tengamos listos nuestros comprobantes (CFDI) pueden ser "Facturas de Proveedor,\n\
    Facturas de Cliente, Recibos de Nómina, etc", aquí como ejemplo manejaremos "Facturas de Proveedor".\n\
    Abrir la ventana de carga de "Facturas de Proveedor" que se encuentra en el "dock".\n\
    Y nos mostrará la siguiente interfaz.</p>\n\
    \n\
    <br><center><img src="img/ayuda/insertar1.png"></center>\n\
    <br>\n\
    <br><p>Pulsamos en "Elegir archivos" y seleccionamos todas las facturas que querramos\n\
    cargar. Una vez seleccionados  pulsamos en el botón "Abrir" y el sistema hará la carga\n\
    automáticamente.</p>\n\
    <br>\n\
    <center><img src="img/ayuda/insertar2.png"></center>\n\
    <br>\n\
    <p>Dentro de la ventana de carga se nos informará de los archivos cargas con éxito\n\
    y los que fuerón cargados con error. En este punto si se desea realizar una nueva carga\n\
    simplemente se vuelven a seleccionar las facturas deseadas</p>\n\
    <br>\n\
    <center><img src="img/ayuda/insertar3.png"></center>\n\
    <br>\n\
    \n\
    <p><b> Drag and Drop</b></p> \n\
    <br><p>\n\
    A diferencia del otro método de carga mediante la interfaz web este tiene la ventaja \n\
    de poder carga comprobantes con su respectivo archivo "PDF" de una manera muy común y \n\
    muy simple. Si ya cuenta con las carpetas compartidas las cuales corresponden a cada\n\
    uno de los contenedores saltarse al paso (b).\n\
    <br>\n\
    <p><b>a)</b> Lo primero que debemos saber es la direción ip que nuestro módemo \n\
    asigno a nuestra "NAS", para esto es necesario abrir el Asistente de Synology \n\
    (Synology Assistant), una vez abierto, la columna de "Dirección IP" es la que \n\
    muestra la IP que se le asigno a nuestro equipo, la copiamos y nos dirigimos a \n\
    "Mi PC" y luego al apartado de "Red".</p>\n\
    <br>\n\
    <br><center><img src="img/ayuda/insertar4.png"></center>\n\
    <br>\n\
    Dentro de esta pantalla sobre la barra de direcciones pegamo la IP y pulsamos "enter".\n\
    \n\
    <br>\n\
    <br><center><img src="img/ayuda/insertar5.png"></center>\n\
    <br>\n\
    <p>Se abrirá un recuadro para introducir un "Usuario y Contraseña" los cuales\n\
    son proporcionados por CSDocs y deben ser introducidos correctamente, seleccione la\n\
    casilla de recordar contraseña para que no este repitiendo este proceso cada que quiera\n\
    cargar CFDI\'s a través de "Drag and Drop". \n\
    <br></p>\n\
    \n\
    <br><p>\n\
    <b>b)</b> Una pantalla como la siguiente es la que muestra el listado con los contenedores\n\
    y al igual que el método de "Carga por interfaz web" debemos seleccionar el contenedor\n\
    al cual le vamos a cargar nuestros comprobantes, recordar que no se deben de introducir\n\
    comprobantes que no corresponden al contenedor, siempre van las "Facturas de Cliente" en el\n\
    contenedor de "Facturas de Cliente", las "Facturasd de Proveedor" van en el contenedor\n\
    de "Facturas de Proveedor".\n\
    </p>\n\
    <br>\n\
    <br><center><img src="img/ayuda/insertar6.png"></center>\n\
    \n\
    <br><br>\n\
    <p>Seleccionar los comprobantes, en este caso utilizado como ejemplo ilustrativo,\n\
    se utilizaron "Facturas de Proveedor" y arrastrar hacia el contenedor "Facturas de Proveedor".\n\
    Recuerde que si desea cargar los comprobantes XML y su respectivo PDF, estos deben de tener\n\
    el mismo nombre aunque tengan formatos diferentes.</p>\n\
    <br>\n\
    <center><img src="img/ayuda/insertar7.png"></center>\n\
    <br>\n\
    </div>');
    
    /*  Actualizar Comprobante */
    
   $('#ayuda_contenido').append('<div id="actualizar_comprobante" class="buscar_ayuda">\n\
   <div class="titulo_ayuda">Reemplazar un Comprobante</div>\n\
    <br>\n\
    <p>Si se desea actualiza la información un comprobante XML \n\
    el sistema brinda esta posibilidad cargando un <b>nuevo</b>\n\
    comprobante con los datos corregidos. Siguiendo los siguientes pasos es muy fácil lograrlo.\n\
    </p>\n\
    <br>\n\
    <p>1. Abrir el "contenedor" al cual corresponde el comprobante XML, para ejemplo ilustrativo\n\
    aquí utilizamos el contenedor de "Facturas de Proveedor", una vez abierta la interfaz localizamos\n\
    el comprobante que va a ser actualizado. </p>\n\
    <br>\n\
    <br><center><img src="img/ayuda/update1.png"></center>\n\
    <br>\n\
    <p>\n\
    En la barra de opciones, seleccionamos la que dice "Actualiza XML".\n\
</p>\n\
    <br><center><img src="img/ayuda/update2.png"></center>\n\
    <br>\n\
    <p>Una vez abierta la ventana de "Actualizar XML", pulsar el botón de "Seleccionar \n\
    archivo".</p>\n\
    <br>\n\
    <br><center><img src="img/ayuda/update3.png"></center>\n\
    <p>\n\
    Se selecciona el XML con la nueva información y pulsar en "Aceptar".\n\
    \n\
    </p>\n\
    <br>\n\
    <p>\n\
    Si todo salio bien, aparecerá una ventana de aviso como la siguiente.\n\
    </p>\n\
    <br><center><img src="img/ayuda/update4.png"></center>\n\
    \n\
    </div>');
    
    /* Ingresar un PDF */
    $('#ayuda_contenido').append('<div id="ingresar_pdf" class="buscar_ayuda">\n\
    <div class="titulo_ayuda">Ingresar un PDF</div>\n\
    <br>\n\
    <p>\n\
    El ingreso de un PDF asociado a un comprobante, nos sirve para visualizar el\n\
    contenido de un comprobante, es posible reemplazar un PDF en cualquier momento\n\
    pero recuerde que un PDF no es un Comprobante Fiscal Válido ante la ley.\n\
    <br>\n\
    Para ingresar un nuevo PDF o sustituir uno se realiza el mismo procedimiento.\n\
    </p>\n\
    <br><p>1. Abrir la ventana del contenedor deseado, para fines ilustrativos \n\
    se realizará el procedimiento con una "Factura de Proveedor" y localizar la fila\n\
    en el "Listado de Facturas" donde se encuentra el comprobante al cual se le asociará \n\
    un documento PDF.\n\
    \n\
    <br><center><img src="img/ayuda/ingreso_pdf1.png"></center>\n\
    <br>\n\
    </p>\n\
    <p>2. Pulsar en la barra de herramientas la opción de "Carga PDF".</p>\n\
    <br><center><img src="img/ayuda/ingreso_pdf2.png"></center>\n\
    <p>3. Pulsar en el botón de "Seleccionar archivo". Localizar el documento deseado y dar doble click en el documento PDF deseado y luego en "Aceptar".</p>\n\
    <br><center><img src="img/ayuda/ingreso_pdf3.png"></center>\n\
    <p>4. Dar click en "Aceptar". </p>\n\
    <br><center><img src="img/ayuda/ingreso_pdf4.png"></center>\n\
    <p>5. Se abrirá un cuadro de diálogo con el resultado de la operación. </p>\n\
    <br><center><img src="img/ayuda/ingreso_pdf5.png"></center>\n\
    </div>');
    
    /*  Enviar Correo */
    $('#ayuda_contenido').append('<div id="enviar_correo" class="buscar_ayuda">\n\
    <div class="titulo_ayuda">Enviar comprobantes por correo</div>\n\
    <br>\n\
    <p>El sistema brinda la posibilidad de enviar comprobantes por correo electrónico\n\
    pulsando en la opción de "Enviar por Correo", antes que nada debemos tener seleccionado\n\
    un CFDI.\n\
    </p>\n\
    <br><center><img src="img/ayuda/envio_mail1.png"></center>\n\
    <br>\n\
    <br><center><img src="img/ayuda/envio_mail2.png"></center>\n\
    <br>\n\
    <p>En el apartado "Para:" debemos ingresar el correo del destinatario, para ingresar más de uno \n\
    pulsar en el botón [+] para agregar a la fila el destinatario escrito y prepararse para agregar otro.\n\
    <br>Es necesario llenar los campos "Asunto" y "Mensaje".</p>\n\
    <p>Si el comprobante cuenta con un documento PDF, el sistema brinda la opción de adjuntarlo junto con\n\
    su comprbante XML activando o desactivando la casilla "Insertar el PDF".\n\
    </p>\n\
    <br><center><img src="img/ayuda/envio_mail3.png"></center>\n\
    ');
    
    /* Imprimir Comprobante */
    
    $('#ayuda_contenido').append('<div id="imprimir_comprobante" class="buscar_ayuda">\n\
    <div class="titulo_ayuda">Imprimir un Comprobante</div>\n\
    <br>\n\
    <p>Imprimir un CFDI es muy fácil, basta con seguir estos sencillos pasos:</p>\n\
    <br>\n\
    <p>1. Para imprimir un comprobante es necesario seleccionar uno.</p>\n\
    <br><center><img src="img/ayuda/imprimir1.png"></center>\n\
    <br>\n\
    <p>2. Sobre la barra de opciones, pulsar "Imprimir" y se mostrará la vista previa de impresión.</p>\n\
    <br><center><img src="img/ayuda/imprimir2.png"></center>\n\
    </div>');
    
    /* Visor de PDF */
    
    $('#ayuda_contenido').append('<div id="visualizar_pdf" class="buscar_ayuda">\n\
    <div class="titulo_ayuda">Visualizar PDF de un comprobante</div>\n\
    <br>\n\
    <p>Los CFDI son archivos en formato XML, por lo tanto su visualización es complicada a simple vista,\n\
    el sistema tiene integrado su propio lector que hace posible la lectura del XML y mostrarlo de una\n\
    manera legible para los usuarios del sistema CSDOCS CFDI.\n\
    <br>Si el usuario "cargo" al sistema comprobantes con su respectivo documento PDF.\n\
    </p>\n\
    <p>1. Seleccionar un comprobante y en la tabla de "Listado de Documentos" en la columna "Documentos"\n\
    pulsar en el icono de "PDF" para poder visualizarlo sobre la pantalla.</p>\n\
    <br><center><img src="img/ayuda/visor_pdf1.png"></center>\n\
    <br>\n\
    <br><center><img src="img/ayuda/visor_pdf2.png"></center>\n\
    </div>');
    
}

