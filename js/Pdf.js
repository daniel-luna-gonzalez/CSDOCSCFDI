/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global visor_Width, visor_Height */

var Pdf = function()
{
    
};

Pdf.prototype.ShowPdf = function(FileRoute)
{
    var self = this;
    $('#PreviewPdf').remove();
    $('body').append('<div id = "PreviewPdf"></div>');
    $('#PreviewPdf').append('<embed src="'+FileRoute+'" width="99%" height="99%"></embed>');
    $('#PreviewPdf').dialog({height: visor_Height,width:visor_Width, modal: true,closeOnEscape:false,title:'Vista Previa Pdf' });
};

Pdf.prototype.ShowPdfAbsolutPath = function(Path)
{
    var path = Path;
    var AbosulutPath = path.split('/');
    console.log(Path);
    var RelativePath = '';
    for(var cont = 3; cont < AbosulutPath.length; cont++)
    {        
        RelativePath+="/"+AbosulutPath[cont];
    }
    this.ShowPdf(RelativePath);
    console.log(RelativePath);
};
