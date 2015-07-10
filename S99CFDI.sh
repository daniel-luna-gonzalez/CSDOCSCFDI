  #!/bin/sh
     case "$1" in
     start)
        # código para iniciar el demonio/programa
		#echo "CFDI iniciado"
		#variable que contiene el estado del monitor		
		
		#Inbox

		mkdir /volume1/Inbox_Timbrado_CFDI_Paq
		chmod -R 777 /volume1/Inbox_Timbrado_CFDI_Paq

		mkdir /volume1/Inbox_Factura_Cliente_XML
		chmod -R 777 /volume1/Inbox_Factura_Cliente_XML

		mkdir /volume1/Inbox_Factura_proveedor	
		chmod -R 777 /volume1/Inbox_Factura_proveedor			

		mkdir /volume1/Inbox_Nomina_TXT
		chmod -R 777 /volume1/Inbox_Nomina_TXT

		mkdir /volume1/Inbox_Pedimento_XML
		chmod -R 777 /volume1/Inbox_Pedimento_XML

		mkdir /volume1/web/Inbox_Recibo_Nomina_XML
		chmod -R 777 /volume1/Inbox_Recibo_Nomina_XML
			
		mkdir /volume1/web/Download
		chmod -R 777 /volume1/web/Download
		
		#Almacenamiento de XMl en NAS
		mkdir /usr/CFDI
		chmod -R 777 /usr/CFDI

		mkdir /volume1/web/_root
		chmod -R 777 /volume1/web/_root

		mkdir /volume1/web/_root/Nomina_xml

		mkdir /volume1/web/_root/Factura_Cliente

		mkdir /volume1/web/_root/Factura_Proveedor
				
		#Directorios de stop y salida de datos PHP

		mkdir /usr/CFDI/Inbox_Nomina_Timbrado	
		mkdir /usr/CFDI/Nomina_XML
		mkdir /usr/CFDI/Factura_Cliente
		mkdir /usr/CFDI/Factura_Proveedor
		mkdir /usr/CFDI/Log
		mkdir /usr/CFDI/invalidos_proveedor
		mkdir /usr/CFDI/invalidos_cliente
		mkdir /usr/CFDI/invalidos_nomina	
		mkdir /usr/CFDI/respuesta_wssat
		mkdir /usr/CFDI/Descarga
		chmod -R 777 /usr/CFDI/Descarga
						
		#Extracción de Adjuntos/Correo

		mkdir /volume1/web/correoCFDI/
		chmod -R 777 /volume1/web/correoCFDI/
		mkdir /volume1/web/correoCFDI/extraidos
		mkdir /volume1/web/correoCFDI/validados
		mkdir /volume1/web/correoCFDI/invalidos
						
		#CSV
		touch /usr/CFDI/CSVmonitor.txt			
		touch /usr/CFDI/LOGcsvtxt.txt
		touch /usr/CFDI/datos.txt
		touch /usr/CFDI/datos_n.txt
		touch /usr/CFDI/estado_timbrado.txt
		touch /usr/CFDI/pila_timbrado.txt
		
		#factura cliente
		touch /usr/CFDI/Factura_Cliente/estado.txt
		touch /usr/CFDI/Factura_Cliente/nuevos.txt
		touch /usr/CFDI/Factura_Cliente/eliminados.txt
		touch /usr/CFDI/Factura_Cliente/pila.txt
		
		#factura proveedor
		touch /usr/CFDI/Factura_Proveedor/estado.txt
		touch /usr/CFDI/Factura_Proveedor/nuevos.txt
		touch /usr/CFDI/Factura_Proveedor/eliminados.txt
		touch /usr/CFDI/Factura_Proveedor/pila.txt
		
		#Recibos de Nómina
		touch /usr/CFDI/Nomina_XML/estado_nominaxml.txt
		touch /usr/CFDI/Nomina_XML/contador.txt
		touch /usr/CFDI/Nomina_XML/datos.txt
		touch /usr/CFDI/Nomina_XML/datos_n.txt
									
		x=1	
		echo $x > /usr/CFDI/CSVmonitor.txt
		echo $x > /usr/CFDI/estado_timbrado.txt
		echo $x > /usr/CFDI/pila.txt
		echo $x > /usr/CFDI/pila_timbrado.txt
		echo $x > /usr/CFDI/Nomina_XML/estado_nominaxml.txt
		echo $x > /usr/CFDI/Nomina_XML/datos_n.txt
		echo $x > /usr/CFDI/Factura_Cliente/estado.txt
		echo $x > /usr/CFDI/Factura_Proveedor/estado.txt
		
		#Se ejecuta el monitor PHP
		#/usr/bin/php -f /volume1/web/Directorio.php
		#nohup php /volume1/web/DAO/Build_CFDI.php &
		#sleep 2;
		nohup php /volume1/web/DAO/vistas.php &
		nohup php /volume1/web/Services/Monitor_CSV_TXT.php &
		sleep 1
		#nohup php /volume1/web/Services/Timbrado_Nomina_XML.php &
		#sleep 1
		nohup php /volume1/web/Services/Monitor_Nomina_XML.php &		
		sleep 1
		nohup php /volume1/web/Services/Monitor_factura_cliente.php &		
		sleep 1
		nohup php /volume1/web/Services/Monitor_factura_proveedor.php &		
		#sleep 1
		#nohup php /volume1/web/DAO/Security_Inserts.php &
		#sleep 1
		
     ;;
     stop)
        # código para parar el demonio/programa
		#echo "CFDI detenido"
		#/usr/bin/php -f /volume1/web/Stop_CSVmonitor.php
		nohup php /volume1/web/Services/Stop_CSVmonitor.php &
		sleep 2
		nohup php /volume1/web/Services/Stop_Timbrado_Nomina.php &
		sleep 2
		nohup php /volume1/web/Services/Stop_Monitor_Nomina_XML.php &
		sleep 2
		nohup php /volume1/web/Services/Stop_Monitor_Factura_Cliente.php &
		sleep 2
		nohup php /volume1/web/Services/Stop_Monitor_Factura_Proveedor.php &
		sleep 2
		touch /usr/CFDI/stoptimbrado.txt
		touch /usr/CFDI/stopcsv.txt
		touch /usr/CFDI/Nomina_XML/stop.txt
		touch /usr/CFDI/Factura_Cliente/stop.txt
		touch /usr/CFDI/Factura_Proveedor/stop.txt
	
		
     ;;
     restart)
        # código para reiniciar el demonio/programa
		
		nohup php /volume1/web/Services/Stop_CSVmonitor.php &
		sleep 2
		nohup php /volume1/web/Services/Stop_Timbrado_Nomina.php &
		sleep 2
		nohup php /volume1/web/Services/Stop_Monitor_Nomina_XML.php &
		sleep 2
		nohup php /volume1/web/Services/Stop_Monitor_Factura_Cliente.php &
		sleep 2
		nohup php /volume1/web/Services/Stop_Monitor_Factura_Proveedor.php &
		sleep 2
		touch /usr/CFDI/stoptimbrado.txt
		touch /usr/CFDI/stopcsv.txt
		touch /usr/CFDI/Nomina_XML/stop.txt
		touch /usr/CFDI/Factura_Cliente/stop.txt
		touch /usr/CFDI/Factura_Proveedor/stop.txt
		
		sleep 1;
				
		mkdir /volume1/Inbox_Timbrado_CFDI_Paq
		mkdir /volume1/Inbox_Factura_Cliente_XML
		mkdir /volume1/Inbox_Factura_proveedor		
		mkdir /volume1/Inbox_Nomina_TXT
		mkdir /volume1/Inbox_Pedimento_XML
		mkdir /volume1/Inbox_Recibo_Nomina_XML
		
		#Permisos de Inbox
		chmod 777 /volume1/Inbox_Timbrado_CFDI_Paq
		chmod 777 /volume1/Inbox_Factura_Cliente_XML
		chmod 777 /volume1/Inbox_Factura_proveedor
		chmod 777 /volume1/Inbox_Nomina_TXT
		chmod 777 /volume1/Inbox_Pedimento_XML
		chmod 777 /volume1/Inbox_Recibo_Nomina_XML
		
		#Almacenamiento de XMl en NAS
		mkdir /usr/CFDI
		mkdir /volume1/web/_root
		mkdir /volume1/web/_root/Nomina_xml
		mkdir /volume1/web/_root/Factura_Cliente
		mkdir /volume1/web/_root/Factura_Proveedor
		
		#Directorios de stop y salida de datos PHP
		mkdir /usr/CFDI/Inbox_Nomina_Timbrado						
		mkdir /usr/CFDI/Nomina_XML
		mkdir /usr/CFDI/Factura_Cliente  
		mkdir /usr/CFDI/Factura_Proveedor
		
		mkdir /usr/CFDI/Log
		chmod -R 777 /usr/CFDI
		
		chmod 777 /usr/CFDI/Log
		
		chmod -R 777 /volume1/web/_root
		
		#CSV
		touch /usr/CFDI/CSVmonitor.txt			
		touch /usr/CFDI/LOGcsvtxt.txt
		touch /usr/CFDI/datos.txt
		touch /usr/CFDI/datos_n.txt
		touch /usr/CFDI/estado_timbrado.txt
		touch /usr/CFDI/pila_timbrado.txt
		
		#factura cliente
		touch /usr/CFDI/Factura_Cliente/estado.txt
		touch /usr/CFDI/Factura_Cliente/nuevos.txt
		touch /usr/CFDI/Factura_Cliente/eliminados.txt
		touch /usr/CFDI/Factura_Cliente/pila.txt
		
		#factura proveedor
		touch /usr/CFDI/Factura_Proveedor/estado.txt
		touch /usr/CFDI/Factura_Proveedor/nuevos.txt
		touch /usr/CFDI/Factura_Proveedor/eliminados.txt
		touch /usr/CFDI/Factura_Proveedor/pila.txt
		
		#Recibos de Nómina
		touch /usr/CFDI/Nomina_XML/estado_nominaxml.txt
		touch /usr/CFDI/Nomina_XML/contador.txt
		touch /usr/CFDI/Nomina_XML/datos.txt
		touch /usr/CFDI/Nomina_XML/datos_n.txt
		
				
		x=1	
		echo $x > /usr/CFDI/CSVmonitor.txt
		echo $x > /usr/CFDI/estado_timbrado.txt
		echo $x > /usr/CFDI/pila.txt
		echo $x > /usr/CFDI/pila_timbrado.txt
		echo $x > /usr/CFDI/Nomina_XML/estado_nominaxml.txt
		echo $x > /usr/CFDI/Nomina_XML/datos_n.txt
		echo $x > /usr/CFDI/Factura_Cliente/estado.txt
		echo $x > /usr/CFDI/Factura_Proveedor/estado.txt
		
		#Se ejecuta el monitor PHP
		#/usr/bin/php -f /volume1/web/Directorio.php
		nohup php /volume1/web/DAO/Build_CFDI.php &
		sleep 2;
		nohup php /volume1/web/DAO/vistas.php &
		nohup php /volume1/web/Services/Monitor_CSV_TXT.php &
		sleep 1
		#nohup php /volume1/web/Services/Timbrado_Nomina_XML.php &
		#sleep 1
		nohup php /volume1/web/Services/Monitor_Nomina_XML.php &		
		sleep 1
		nohup php /volume1/web/Services/Monitor_factura_cliente.php &		
		sleep 1
		nohup php /volume1/web/Services/Monitor_factura_proveedor.php &		
		sleep 1
		nohup php /volume1/web/DAO/Security_Inserts.php &
		sleep 1
     ;;

     esac
	 
	 exit 0