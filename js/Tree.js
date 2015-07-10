/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var ClassTree = function()
{
    this.cmp = function(a, b) {
        a = a.data.title.toLowerCase();
        b = b.data.title.toLowerCase();
        return a > b ? 1 : a < b ? -1 : 0;
     };    
};
ClassTree.prototype.RemoveTree = function(content)
{
    var emptyTest = $("#"+content+"Tree").is(':empty');
    if(!emptyTest)
    {
        var node = $("#"+content+"Tree").dynatree('getTree');
        if(node)
            $("#"+content+"Tree").dynatree('destroy');
        $("#"+content+"Tree").empty();
    }      
};
ClassTree.prototype.InitTree = function(content)
{      
    $("#"+content+"Tree").dynatree(
        {
            imagePath: "media/css/skin-custom/",
            onClick: function(node)
            {                  
                var title=node.data.key;
                var id = title.replace("CFDI", "");
                if(id>0)
                {
                    var cfdi = new CFDI();
                    cfdi.GetFiles(content, id);
                }
                else
                    node.sortChildren(ClassTree.cmp, false);
            },
          expand: true, minExpandLevel: 2
        });      
        
        var tree = $("#"+content+"Tree").dynatree("getTree");
        var node = tree.getNodeByKey('Root'+content+'Tree');
        if(node)
            node.sortChildren(ClassTree.cmp, false);
};
