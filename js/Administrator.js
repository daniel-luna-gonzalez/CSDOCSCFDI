/*  Clase empleada por los administradores de cada empresa */

$(document).ready(function()
{
    $('.AdministratorConsole').click(function()
    {
        var admin = new Administrator();
        admin.BuildAdministratorConsole();
    });
});
var Administrator = function()
{
    
};

Administrator.prototype.BuildAdministratorConsole = function()
{    
    $('#AdministratorConsole').remove();    
    $('body').append('\n\
        <div id="AdministratorConsole">\n\
            <div id="WorkspaceAdmin" class = "Workspace">\n\
                    <div id="salida_admin_ventana_trabajo"></div>\n\
            </div>\n\
             <div id="menu_consola">\n\
                <div id="AdministratorAccordion">\n\
                    <div>\n\
                    <h3><a href="#">Usuarios</a></h3>\n\
                        <div>\n\
                            <table class = "TableInsideAccordion">\n\
                                <tr class = "UsersLink">\n\
                                    <td class = "TdIcon"><img src="img/users.png"></td>\n\
                                    <td >Usuarios</td>\n\
                                </tr>\n\
                            </table>\n\
                        </div>\n\
                     </div>\n\
        \n\
                    <div>\n\
                        <h3><a href="#">Reportes</a></h3>\n\
                        <div>\n\
                            <table class = "TableInsideAccordion">\n\
                                <tr class = "LogMail">\n\
                                    <td class = "TdIcon"><img src="img/register.png"></td>\n\
                                    <td  title="Registro del día">Registros</td>\n\
                                </tr>\n\
                            </table>\n\
                        </div>\n\
                    </div>\n\
        \n\
                    <div>\n\
                      <h3><a href="#">Sistema</a></h3>\n\
                        <div>\n\
                            <table class = "TableInsideAccordion">\n\
                                <tr class = "MailLink">\n\
                                    <td class = "TdIcon"><img src="img/mail-icon.png"></td>\n\
                                    <td  title="Mail">Mail</td>\n\
                                </tr>\n\
                            </table>\n\
                        </div>\n\
                    </div>\n\
                </div>\n\
            </div>\n\
        </div>\n\
    ');
    
    $('#WorkspaceAdmin').empty();    
    
    $("#AdministratorConsole").dialog({minHeight: 550,minWidth: 1000,   closeOnEscape:false,position:"center",title:'Consola de Administración'}).dialogExtend(BotonesWindow);          
                
    /*  Permite que varios acordeones esten abiertos al mismo tiempo  */    
    $("#AdministratorAccordion > div").accordion({ header: "h3", collapsible: true });
    
     $('#AdministratorAccordion table').on( 'click', 'tr', function ()
    {
        var active = $('#AdministratorAccordion table tr.TableInsideAccordionFocus');                
        $('#AdministratorAccordion table tr').removeClass('TableInsideAccordionFocus');
        $('#AdministratorAccordion table tr').removeClass('TableInsideAccordionActive');
        $(active).addClass('TableInsideAccordionFocus');
        $(this).removeClass('TableInsideAccordionHoverWithoutClass');
        $(this).addClass('TableInsideAccordionActive');     
    });
    $('#AdministratorAccordion table tr').hover(function()
    {
        if($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
            $(this).addClass('TableInsideAccordionHoverWithClass');
        else
            $(this).addClass('TableInsideAccordionHoverWithoutClass');
    });
    $('#AdministratorAccordion table tr').mouseout(function()
    {
        if($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
            $(this).removeClass('TableInsideAccordionHoverWithClass');
        else
            $(this).removeClass('TableInsideAccordionHoverWithoutClass');
    });
    if($('#LinkKEnterpriseList').length>0)
        $('#LinkKEnterpriseList').click();
    else
        if($('.UsersLink').length>0)
            $('.UsersLink').click();
    
    /* 
     * Llamado a métodos para mostrar información de cada opción del menú lateral */
    
    $('.UsersLink').click(function()
    {
        var users = new Users();
        users.DisplayUserList();
    }); 
    
    $('.MailLink').click(function()
    {
        var email = new EmailEngine();
        email.BuildChartActiveEmails();
    });
    
    $('.UsersLink').click();
};