const providerInvoice     = "FACTURA PROVEEDOR - Adjuntá la factura"
const providerPayment     = "COMPROBANTE PAGO A PROVEEDORES - Adjuntá la documentación relativa al pago (comprobante, retenciones, etc). \nEn caso de ser varios, se puede adjuntar un archivo comprimido (.zip) "
const providerPaymentNoInvoice = "COMPROBANTE PAGO A PROVEEDORES previo a factura- Adjuntá la documentación relativa al pago (comprobante, retenciones, etc). \nEn caso de ser varios, se puede adjuntar un archivo comprimido (.zip) "
const providerPaymentWithInvoice = "COMPROBANTE PAGO A PROVEEDORES con factura - Adjuntá la documentación relativa al pago (comprobante, retenciones, etc). \nEn caso de ser varios, se puede adjuntar un archivo comprimido (.zip) "
const providerFolderId = "16H6crwybQ8g9-AUoLSt1xyDs3XVH37Qo"

const clientInvoiceSend = "ENVÍO FACTURA - Adjuntá la factura a enviar"
const clientInvoiceNoSend = "FACTURA CLIENTE (SIN ENVÍO) -  Adjuntá la factura"
const clientPayment = "COMPROBANTE COBRO A CLIENTES - Adjuntá la documentación relativa al pago del cliente (comprobante, retenciones, etc). \nEn caso de ser varios, se puede adjuntar un archivo comprimido (.zip) "
const clientFolderId = "1H_xoDq41y3xAMw17fzvcZJ3z_SMKjaxf"


const pendingSalariesPayment = "COMPROBANTE PAGO SUELDOS/HONORARIOS - Adjuntá la documentación relativa al pago (comprobante, etc).\nEn caso de ser varios, se puede adjuntar un archivo comprimido (.zip)"
const salariesUpload = "CARGA SUELDOS/HONORARIOS - Adjuntá la documentación asociada (Factura monotributista, Recibos de sueldos). \nEn caso de ser varios, se puede adjuntar un archivo comprimido (.zip) "
const salariesPayment = "PAGO DE SUELDOS/HONORARIOS - Adjuntá la documentación relativa al pago (recibo de sueldo, factura monotributista, comprobante de pago, etc). \nEn caso de ser varios, se puede adjuntar un archivo comprimido (.zip) "
const salariesFolderId = "13AuSoO7ciF1YT6eST6gPA370LakH2MV2"


const taxesPayment = "PAGO DE IMPUESTOS - Adjuntá la documentación relativa al pago (comprobante, etc). \nEn caso de ser varios, se puede adjuntar un archivo comprimido (.zip) "
const taxesUpload = "CARGA IMPUESTOS - Adjuntá el VEP del impuesto"
const pendingTaxesPayment = "PAGO IMPUESTOS - Adjuntá la documentación relativa al pago del impuesto"
const taxesFolderId = "1GnqC7MGDWSrMQSipR5MxdISFl8iarvpV"


function uploadAttachedFiles(){
    var form = FormApp.openById(formId);
    var formResponses = form.getResponses();
    var formResponse = formResponses[formResponses.length - 1]

    var itemResponses = formResponse.getItemResponses();


    for (var j = 0; j < itemResponses.length; j++) {
        let itemResponse = itemResponses[j];
        let title        = itemResponse.getItem().getTitle();
        switch(title){
            case clientInvoiceSend:
            case clientInvoiceNoSend:
            case clientPayment:
                makeFilesCopy(itemResponse.getResponse(), clientFolderId);
                break;
            case providerInvoice:
            case providerPayment:
            case providerPaymentNoInvoice:
            case providerPaymentWithInvoice:
                makeFilesCopy(itemResponse.getResponse(), providerFolderId);
                break;
            case pendingSalariesPayment:
            case salariesUpload:
            case salariesPayment:
                makeFilesCopy(itemResponse.getResponse(), salariesFolderId);
                break;
            case taxesPayment:
            case taxesUpload:
            case pendingTaxesPayment:
                makeFilesCopy(itemResponse.getResponse(), taxesFolderId);
                break;
        }
    }
}