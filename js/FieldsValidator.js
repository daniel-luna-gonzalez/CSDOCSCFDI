/* -----------------------------------------------------------------------------
 * 
 * Clase que valida los campos de texto antes de enviar los datos al servidor.
 * 
 * El objeto que recibe esta clase debe contener los siguientes atributos:
 * 
 * <input type = "text/button/textarea" class = "/required/FormStandar/" FieldType = "type" FieldLength = "Length">
 * 
 * Puntos a validar:
 * 
 *      Campos requeridos
 *      Tipo de dato
 *      Longitud de datos
 * 
 -------------------------------------------------------------------------------*/

var ClassFieldsValidator = function()
{    
    var self = this;
    
    _AnalizeDataInteger = function(input)
    {
//        console.log(input);
        var Flag = 1;
        var FieldLength = self.GetDataLength(input);
        var RequiredField = self.CheckIfIsRequiredField(input);
        var FieldValue = $(input).val();
        
        if(!($.isNumeric(FieldValue)))
        {
            self.AddClassRequiredActive(input);
            return 0;
        }
        else
            self.RemoveClassRequiredActive(input);
        
        if(typeof(FieldLength)===undefined || FieldLength === '')
            FieldLength = 0;
        
        if(FieldValue.length===0 && RequiredField===1)
        {
            self.AddClassRequiredActive(input);
            $(input).attr('title','El campo es obligatorio');
            Flag = 0;
            return Flag;
        }
        
        if(FieldValue.length===0)  /* Si el campo esta vacio y no es requerido se ignora */
        {
            self.RemoveClassRequiredActive(input);
            return Flag;
        }
        
        if(!self.TestIntegerRegularExpression(input))
        {
//                        console.log('Campo inválido mediante regular expression');
            $(input).attr('title','Expresión inválida');
            Flag = 0;
            self.AddClassRequiredActive(input);
            return Flag;
        }
        else
        {
//                        console.log('Campo válido mediante regular expression');
            self.RemoveClassRequiredActive(input);
        }       

        FieldValue = parseInt(FieldValue);
        if(isNaN(FieldValue))
        {
//                        console.log('Entero inválido '+FieldValue);
            self.AddClassRequiredActive(input);
            $(input).attr('title','El campo debe ser numérico');
        }
        else
        {
//                        console.log('Es un entero válido '+FieldValue);
            if(FieldLength>0)
            {
                if(FieldValue.toString().length > FieldLength)
                {
                    self.AddClassRequiredActive(input);
                    $(input).attr('title','El campo debe ser menor a '+FieldLength+' caracteres');
                    Flag = 0;
                    console.log('Número mayor al permitido '+FieldLength);
                }
            }            
            else
            {
                if(FieldValue>-2147483648 && FieldValue<2147483647)
                {
                    console.log('Rango permitido '+FieldLength);
                    self.RemoveClassRequiredActive(input);
                }
                else
                {
                    self.AddClassRequiredActive(input);
                    $(input).attr('title','El rango permitido es entre -2147483648 y 2147483647');
                    Flag = 0;
                    console.log('Número mayor al permitido '+FieldLength);
                }                
            }
        }  
        
        return Flag;
    };
    
    _AnalizeDataVarchar = function(input)
    {
//        console.log(input);
        var Flag = 1;
        var FieldLength = self.GetDataLength(input);
        var RequiredField = self.CheckIfIsRequiredField(input);
        var FieldValue = $(input).val();        

        if(FieldLength===undefined)
            FieldLength = 0;
        
        if(FieldValue.length===0 && RequiredField===1)
        {
//                console.log('El campo esta vacio');
            Flag = 0;
            self.AddClassRequiredActive(input);
            $(input).attr('title','El campo es obligatorio');
            return Flag;
        }
        
        if(FieldValue.length===0)
        {
            self.RemoveClassRequiredActive(input);
            return Flag;
        }
        
        
        if(!self.TestTextRegularExpression(input))
        {
//                        console.log('Campo inválido mediante regular expression');
            $(input).attr('title','Expresión inválida');
            Flag = 0;
            self.AddClassRequiredActive(input);
            return Flag;
        } 
            
        if(FieldValue.length>FieldLength)
        {
             self.AddClassRequiredActive(input);
             Flag = 0;
             $(input).attr('title','El campo debe ser menor a '+FieldLength);
        }
        else
            self.RemoveClassRequiredActive(input);
        
        return Flag;     
    };    
    
    _AnalizeDataText = function(input)
    {
//        console.log(input);
        var Flag = 1;
        var RequiredField = self.CheckIfIsRequiredField(input);
        var FieldValue = $(input).val();
//        console.log('Analizando campo Texto');
        
        if(FieldValue.length===0 && RequiredField===1)
        {
//                console.log('El campo esta vacio');
            Flag = 0;
            self.AddClassRequiredActive(input);
            $(input).attr('title','El campo es obligatorio');
            return Flag;
        }
        
        if(FieldValue.length===0)
        {
            self.RemoveClassRequiredActive(input);
            return Flag;
        }
        var validation =self.TestTextRegularExpression(input);
        if(!validation)
        {
//                        console.log('Campo inválido mediante regular expression');
            $(input).attr('title','Expresión inválida');
            Flag = 0;
            self.AddClassRequiredActive(input);
            return Flag;
        }
        else
        {
//                        console.log('Campo válido mediante regular expression');
            self.RemoveClassRequiredActive(input);
        }       
        
        return Flag;     
    };
    
    _AnalizeDataDouble = function(input)
    {
//        console.log(input);
        var Flag = 1;
        var FieldLength = self.GetDataLength(input);
        var RequiredField = self.CheckIfIsRequiredField(input);
        var FieldValue = $(input).val();
        
        if(!($.isNumeric(FieldValue)))
        {
            self.AddClassRequiredActive(input);
            return 0;
        }
        else
            self.RemoveClassRequiredActive(input);
        
        if(typeof(FieldLength)===undefined || FieldLength === '')
            FieldLength = 0;
        
        if(FieldValue.length===0 && RequiredField===1)
        {
            self.AddClassRequiredActive(input);
            $(input).attr('title','El campo es obligatorio');
            Flag = 0;
            return Flag;
        }
        
        if(FieldValue.length===0)  /* Si el campo esta vacio y no es requerido se ignora */
        {
            self.RemoveClassRequiredActive(input);
            return Flag;
        }
        
        if(!self.TestDoubleRegularExpression(input))
        {
//                        console.log('Campo inválido mediante regular expression');
            $(input).attr('title','Expresión inválida');
            Flag = 0;
            self.AddClassRequiredActive(input);
            return Flag;
        }
        else
        {
//                        console.log('Campo válido mediante regular expression');
            self.RemoveClassRequiredActive(input);
        }       

        FieldValue = parseInt(FieldValue);
        if(isNaN(FieldValue))
        {
//                        console.log('Entero inválido '+FieldValue);
            self.AddClassRequiredActive(input);
            $(input).attr('title','El campo debe ser numérico');
        }
        else
        {
//                        console.log('Es un entero válido '+FieldValue);
            if(FieldLength>0)
            {
                if(FieldValue.toString().length > FieldLength)
                {
                    self.AddClassRequiredActive(input);
                    $(input).attr('title','El campo debe ser menor a '+FieldLength+' caracteres');
                    Flag = 0;
                    console.log('Número mayor al permitido '+FieldLength);
                }
            }            
            else
            {
                if((FieldValue>-1.7976931348623157E+308 && FieldValue<-2.2250738585072014E-308)|| FieldValue ===0 ||(FieldValue>2.2250738585072014E-308 && FieldValue<1.7976931348623157E+308))
                {
                    console.log('Rango permitido');
                    self.RemoveClassRequiredActive(input);
                }
                else
                {
                    self.AddClassRequiredActive(input);
                    $(input).attr('title','El rango permitido es entre (-1.7976931348623157E+308 y -2.2250738585072014E-308) y (2.2250738585072014E-308 y 1.7976931348623157E+308)');
                    Flag = 0;
                    console.log('Número mayor al permitido '+FieldLength);
                }                
            }
        }  
        
        return Flag;
    };
    
    _AnalizeDataFloat = function(input)
    {
        var Flag = 1;
        var FieldLength = self.GetDataLength(input);
        var RequiredField = self.CheckIfIsRequiredField(input);
        var FieldValue = $(input).val();
        
        if(!($.isNumeric(FieldValue)))
        {
            self.AddClassRequiredActive(input);
            return 0;
        }
        else
            self.RemoveClassRequiredActive(input);
        
        if(typeof(FieldLength)===undefined || FieldLength === '')
            FieldLength = 0;
        
        if(FieldValue.length===0 && RequiredField===1)
        {
            self.AddClassRequiredActive(input);
            $(input).attr('title','El campo es obligatorio');
            Flag = 0;
            return Flag;
        }
        
        if(FieldValue.length===0)  /* Si el campo esta vacio y no es requerido se ignora */
        {
            self.RemoveClassRequiredActive(input);
            return Flag;
        }
        
        if(!self.TestFloatRegularExpression(input))
        {
//                        console.log('Campo inválido mediante regular expression');
            $(input).attr('title','Expresión inválida');
            Flag = 0;
            self.AddClassRequiredActive(input);
            return Flag;
        }
        else
        {
//                        console.log('Campo válido mediante regular expression');
            self.RemoveClassRequiredActive(input);
        }       

        FieldValue = parseInt(FieldValue);
        if(isNaN(FieldValue))
        {
//                        console.log('Entero inválido '+FieldValue);
            self.AddClassRequiredActive(input);
            $(input).attr('title','El campo debe ser numérico');
        }
        else
        {
//                        console.log('Es un entero válido '+FieldValue);
            if(FieldLength>0)
            {
                if(FieldValue.toString().length > FieldLength)
                {
                    self.AddClassRequiredActive(input);
                    $(input).attr('title','El campo debe ser menor a '+FieldLength+' caracteres');
                    Flag = 0;
                    console.log('Número mayor al permitido '+FieldLength);
                }
            }            
            else
            {
                if((FieldValue>-3.402823466E+38 && FieldValue<-1.175494351E-38) || FieldValue ===0 ||(FieldValue>1.175494351E-38 && FieldValue<3.402823466E+38))
                {
//                    console.log('Rango permitido');
                    self.RemoveClassRequiredActive(input);
                }
                else
                {
                    self.AddClassRequiredActive(input);
                    $(input).attr('title','El rango permitido es entre (-1.7976931348623157E+308 y -2.2250738585072014E-308) y (2.2250738585072014E-308 y 1.7976931348623157E+308)');
                    Flag = 0;
//                    console.log('Número mayor al permitido '+FieldLength);
                }                
            }
        }  
        
        return Flag;
    };
    
    _AnalizeDataDate = function(input)
    {                
        var Flag = 1;
        var FieldLength = self.GetDataLength(input);
        var RequiredField = self.CheckIfIsRequiredField(input);
        var FieldValue = $(input).val();
        
        if(typeof(FieldLength)===undefined || FieldLength === '')
            FieldLength = 0;
        
        if(FieldValue.length===0 && RequiredField===1)
        {
            self.AddClassRequiredActive(input);
            $(input).attr('title','El campo es obligatorio');
            Flag = 0;
            return Flag;
        }      
        
        if(FieldValue.length===0)
        {
            self.RemoveClassRequiredActive(input);
            return 0;
        }
        
        if(!self.TestDateRegularExpression(input))
        {
//                        console.log('Campo inválido mediante regular expression');
            $(input).attr('title','Expresión inválida');
            Flag = 0;
            self.AddClassRequiredActive(input);
            return Flag;
        }
        else
        {
//                        console.log('Campo válido mediante regular expression');
            self.RemoveClassRequiredActive(input);
        }   
        
        return Flag;
        
    };
    
    _AnalizeFile = function(input)
    {

        var Flag = 1;
        var RequiredField = self.CheckIfIsRequiredField(input);
        var File = $(input).prop('files');

        if(File.length===0 && RequiredField===1)
        {
            self.AddClassRequiredActive(input);
            $(input).attr('title','El campo es obligatorio');
            Flag = 0;
            return Flag;
        }      
        
        if(File.length===0)
        {
            Flag = 0;
            self.AddClassRequiredActive(input);
        }
        else
        {
            $(input).attr('title','');
            self.RemoveClassRequiredActive(input);
        }
        
        return Flag;
    };
};



ClassFieldsValidator.prototype.ValidateFields = function(Object)
{
//    console.log(Object);
    var self = this;
    var Flag = 1;
    var FinalFlag = 1;
    $(Object).each(function()
    {
        var attr = $(this).attr('FieldType');

        if(attr.toLowerCase()!=='file')
        {
            var trim = $(this).val().trim(' ',''); 
            $(this).val(trim);
        }
       
        var DataType = self.GetDataType(this);
        if(DataType!==undefined)
            Flag = self.CheckFieldsLength(this);    
        if(Flag===0)
            FinalFlag = 0;
    });
    
    return FinalFlag;
};

ClassFieldsValidator.prototype.CheckFieldsLength = function(object)
    {
        var self = this;
        var Flag = 1;
        var DataType = this.GetDataType(object);
        
        if(typeof(DataType)===undefined)
        {
            console.log("El tipo de campo es indefinido contiene el valor "+$(object).val());
            return 0;
        }
                
        switch(DataType)
        {
            case 'varchar':
                Flag = _AnalizeDataVarchar(object);
                    break;
                    
            case 'int':
                Flag = _AnalizeDataInteger(object);
                    break;
                
            case 'integer':
                Flag = _AnalizeDataInteger(object);
                    break;

            case 'float':       
                Flag = _AnalizeDataFloat(object);
                    break;

            case 'double':
                Flag = _AnalizeDataDouble(object);
                    break;
                
            case 'date':
                _AnalizeDataDate(object);
                    break;
                
            case 'text':
                Flag = _AnalizeDataText(object);
                    break;
                    
            case 'file':
                Flag = _AnalizeFile(object);
                    break;
        }    
        
        return Flag;
    };

ClassFieldsValidator.prototype.AddClassRequiredActive = function(input)
{
    if(!$(input).hasClass('RequiredActivo'))
        $(input).addClass('RequiredActivo');
};

ClassFieldsValidator.prototype.RemoveClassRequiredActive = function(input)
{
    if($(input).hasClass('RequiredActivo'))
        $(input).removeClass('RequiredActivo');
};

ClassFieldsValidator.prototype.CheckIfIsRequiredField = function(input)
{
    if($(input).hasClass('required'))
        return 1;
    else
        return 0;
};

ClassFieldsValidator.prototype.GetDataType = function(input)
{
//    console.log(input);
    var DataType = $(input).attr('FieldType');
    if(DataType === undefined)
        console.log("El elemento "+input+" no contiene definido el tipo de dato que acepta");
    else
        DataType = DataType.toLowerCase();
    
    return DataType;
};

ClassFieldsValidator.prototype.GetDataLength = function(input)
{
    var DataLength = $(input).attr('FieldLength');
    if(DataLength===undefined)
    {
        console.log('La longitud del campo '+ $(input).attr('id') +' esta indefinida');
    }
    return DataLength;
};

ClassFieldsValidator.prototype.TextRegularExpression = function(input)
{
    var RegularExpresion = /[^a-zA-Z0-9\_\*\$\#\@\!\¡\?\¿\=\<\>\.\,\;\:\-\"\°\+\%\\\/\sáéíóúñÁÉÍÓÚÑ]/g;
    input.value = input.value.replace(RegularExpresion,'');
};

ClassFieldsValidator.prototype.TestTextRegularExpression = function(input)
{
    var RegularExpresion = /^([a-zA-Z0-9\_\*\$\#\@\!\¡\?\¿\=\<\>\.\,\;\:\-\"\°\+\\%\\/\sáéíóúñÁÉÍÓÚÑ])+$/g;
    var Value = $(input).val();
    if(RegularExpresion.test(Value))
        return 1;
    else
        return 0;
};

ClassFieldsValidator.prototype.IntegerRegularExpression = function(input)
{
    var RegularExpresion = /[^0-9\-]/g;
    input.value = input.value.replace(RegularExpresion,'');
};

ClassFieldsValidator.prototype.TestIntegerRegularExpression = function(input)
{
    var RegularExpresion = /^[-]?\d+$/g;
    var Value = $(input).val();
    if(RegularExpresion.test(Value))
        return 1;
    else
        return 0;
};

ClassFieldsValidator.prototype.DoubleRegularExpression = function(input)
{
    var RegularExpresion = /[^0-9\-\.]/g;
    input.value = input.value.replace(RegularExpresion,'');
};

ClassFieldsValidator.prototype.TestDoubleRegularExpression = function(input)
{
    var RegularExpresion = /^(\d|-)?(\d|,)*\.?\d*$/g;
    var Value = $(input).val();
    if(RegularExpresion.test(Value))
        return 1;
    else
        return 0;
};

ClassFieldsValidator.prototype.FloatRegularExpression = function(input)
{
    var RegularExpresion = /[^0-9\-\.]/g;
    input.value = input.value.replace(RegularExpresion,'');
};

ClassFieldsValidator.prototype.TestFloatRegularExpression = function(input)
{
    var RegularExpresion = /^(\d|-)?(\d|,)*\.?\d*$/g;
    var Value = $(input).val();
    if(RegularExpresion.test(Value))
        return 1;
    else
        return 0;
};

ClassFieldsValidator.prototype.DateRegularExpression = function(input)
{
    var RegularExpresion = /[^0-9\-]/g;
    input.value = input.value.replace(RegularExpresion,'');
};

ClassFieldsValidator.prototype.TestDateRegularExpression = function(input)
{
    var RegularExpresion = /^\d{2,4}\-\d{1,2}\-\d{1,2}$/g;
    var Value = $(input).val();
    if(RegularExpresion.test(Value))
        return 1;
    else
        return 0;
};

/* fecha = ^\d{1,2}\/\d{1,2}\/\d{2,4}$ */


ClassFieldsValidator.prototype.InspectCharacters = function(Object)
{
    var self = this;   
    $(Object).each(function()
    {        
        
        $(this).on("cut paste",function(e) {
//             console.log('cut paste');
            e.preventDefault();
          });
        
        $(this).keyup(function()
        {
            var DataType = self.GetDataType(this);
            if(DataType === undefined)
                return;
            DataType = DataType.toLowerCase();                         
            
            switch (DataType)
            {
                case 'varchar':
                    self.TextRegularExpression(this);
                    break;
                    
                case 'int':
                    self.IntegerRegularExpression(this);
                    break;

                case 'integer':
                    self.IntegerRegularExpression(this);
                    break;

                case 'float':
                    self.FloatRegularExpression(this);
                    break;

                case 'double':
                    self.DoubleRegularExpression(this);
                    break;

                case 'date':

                    break;

                case 'text':
                    self.TextRegularExpression(this);
                    break;
            }                
        });
    });
};


