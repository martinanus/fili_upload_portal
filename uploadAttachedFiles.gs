const providerInvoice     = "FACTURA PROVEEDOR - Adjuntá la factura"
const providerPayment     = "COMPROBANTE PAGO A PROVEEDORES - Adjuntá la documentación relativa al pago (comprobante, retenciones, etc). \nEn caso de ser varios, se puede adjuntar un archivo comprimido (.zip) "

const providerPaymentNoInvoice = "COMPROBANTE PAGO A PROVEEDORES previo a factura- Adjuntá la documentación relativa al pago (comprobante, retenciones, etc). \nEn caso de ser varios, se puede adjuntar un archivo comprimido (.zip) "
const providerPaymentWithInvoice = "COMPROBANTE PAGO A PROVEEDORES con factura - Adjuntá la documentación relativa al pago (comprobante, retenciones, etc). \nEn caso de ser varios, se puede adjuntar un archivo comprimido (.zip) "

const clientInvoiceSend = "ENVÍO FACTURA - Adjuntá la factura a enviar"
const clientInvoiceNoSend = "FACTURA CLIENTE (SIN ENVÍO) -  Adjuntá la factura"
const clientPaymentPrevInvoice = "COMPROBANTE COBRO A CLIENTES con factura previa - Adjuntá la documentación relativa al pago del cliente (comprobante, retenciones, etc). \nEn caso de ser varios, se puede adjuntar un archivo comprimido (.zip) "
const clientPayment = "COMPROBANTE COBRO A CLIENTES - Adjuntá la documentación relativa al pago del cliente (comprobante, retenciones, etc). \nEn caso de ser varios, se puede adjuntar un archivo comprimido (.zip) "

const pendingSalariesPayment = "COMPROBANTE PAGO SUELDOS/HONORARIOS - Adjuntá la documentación relativa al pago (comprobante, etc).\nEn caso de ser varios, se puede adjuntar un archivo comprimido (.zip)"

const salariesUpload = "CARGA SUELDOS/HONORARIOS - Adjuntá la documentación asociada (Factura monotributista, Recibos de sueldos). \nEn caso de ser varios, se puede adjuntar un archivo comprimido (.zip) "
const salariesPayment = "PAGO DE SUELDOS/HONORARIOS - Adjuntá la documentación relativa al pago (recibo de sueldo, factura monotributista, comprobante de pago, etc). \nEn caso de ser varios, se puede adjuntar un archivo comprimido (.zip) "

const taxesPayment = "PAGO DE IMPUESTOS - Adjuntá la documentación relativa al pago (comprobante, etc). \nEn caso de ser varios, se puede adjuntar un archivo comprimido (.zip) "
const taxesUpload = "CARGA IMPUESTOS - Adjuntá el VEP del impuesto"
const pendingTaxesPayment = "PAGO IMPUESTOS - Adjuntá la documentación relativa al pago del impuesto"

const selectFolderForProviderPayment1 = "¿En qué carpeta de Pagos de Drive querés cargar la factura? "
const selectFolderForProviderPayment2 = "¿En qué carpeta de Pagos de Drive querés cargar el pago? "

const selectSubcatForSalaries1 = "Indicá la subcategoría de Honorarios a registrar"
const selectSubcatForSalaries2 = "Seleccione los sueldos/honorarios que quiere marcar como pagos"

function uploadAttachedFiles(){
    var form = FormApp.openById(formId);
    var formResponses = form.getResponses();
    var formResponse = formResponses[formResponses.length - 1]

    var itemResponses = formResponse.getItemResponses();
    var destinationFolderId = ""
    var providerFilesIds = []
    var salariesFilesIds = []

    for (var j = 0; j < itemResponses.length; j++) {
        let itemResponse = itemResponses[j];
        let title        = itemResponse.getItem().getTitle();
        switch(title){
            case clientInvoiceSend:
            case clientInvoiceNoSend:
            case clientPaymentPrevInvoice:
            case clientPayment:
                destinationFolderId = searchFolderId("Cobranzas")
                makeFilesCopy(itemResponse.getResponse(), destinationFolderId);
                break;
            case providerPaymentWithInvoice:
                destinationFolderId = searchFolderId("Pagos")
                makeFilesCopy(itemResponse.getResponse(), destinationFolderId);
                break;
            case pendingSalariesPayment:
            case salariesUpload:
            case salariesPayment:
                salariesFilesIds.push(itemResponse.getResponse());
                break;
            case taxesPayment:
            case taxesUpload:
            case pendingTaxesPayment:
                destinationFolderId = searchFolderId("Pagos", "Impuestos")
                makeFilesCopy(itemResponse.getResponse(), destinationFolderId);
                break;
            case providerInvoice:
            case providerPayment:
            case providerPaymentNoInvoice:
                providerFilesIds.push(itemResponse.getResponse());
                break;
            case selectFolderForProviderPayment1:
            case selectFolderForProviderPayment2:
                var paymentType = itemResponse.getResponse();
                break;
            case selectSubcatForSalaries1:
            case selectSubcatForSalaries2:
                var salaryType = getSalaryType(itemResponse.getResponse());
                break;
        }
    }
    if (providerFilesIds.length){
        destinationFolderId = searchFolderId("Pagos", paymentType)
        for (let i = 0 ; i < providerFilesIds.length ; i++) {
            makeFilesCopy(providerFilesIds[i], destinationFolderId);
        }
    }

    if (salariesFilesIds.length){
        destinationFolderId = searchFolderId("Pagos", salaryType)
        for (let i = 0 ; i < salariesFilesIds.length ; i++) {
            makeFilesCopy(salariesFilesIds[i], destinationFolderId);
        }
    }
}

function getSalaryType(response){
    if (response.includes("Actores")){
        return "Actores";
    }
    return "Empleados"
}