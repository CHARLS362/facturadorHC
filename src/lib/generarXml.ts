import { create } from 'xmlbuilder2';

// --- INTERFACES DE DATOS (El "molde" para la información) ---

export type TipoComprobante = '01' | '03'; // 01: Factura, 03: Boleta

export interface Empresa {
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
}

export interface Cliente {
  tipoDocumento: '1' | '4' | '6' | '7' | '0' | '-';
  numeroDocumento: string;
  razonSocial: string;
}

export interface ItemComprobante {
  idInterno: string;
  descripcion: string;
  cantidad: number;
  valorUnitario: number; 
  precioUnitario: number; 
  unidadMedida: string;
  tipoAfectacionIgv: '10' | '20' | '30'; // 10: Gravado, 20: Exonerado, 30: Inafecto
}

export interface ComprobanteData {
  tipoComprobante: TipoComprobante;
  serie: string;
  numero: string;
  fechaEmision: Date;
  moneda: 'PEN' | 'USD';
  empresa: Empresa;
  cliente?: Cliente; // Cliente es opcional
  items: ItemComprobante[];
}


/**
 * @param 
 * @returns 
 */
export function generarComprobanteXml(data: ComprobanteData): string {
  const { empresa, items } = data;
  const IGV_RATE = 0.18;

  let totalGravado = 0, totalExonerado = 0, totalInafecto = 0, totalIgv = 0;

  const itemsCalculados = items.map((item, index) => {
    const valorVenta = item.cantidad * item.valorUnitario;
    let igvItem = 0;

    if (item.tipoAfectacionIgv === '10') {
      igvItem = valorVenta * IGV_RATE;
      totalGravado += valorVenta;
      totalIgv += igvItem;
    } else if (item.tipoAfectacionIgv === '20') {
      totalExonerado += valorVenta;
    } else {
      totalInafecto += valorVenta;
    }

    return { ...item, id: index + 1, valorVenta, igv: igvItem };
  });
  
  const totalValorVenta = totalGravado + totalExonerado + totalInafecto;
  const totalPrecioVenta = totalValorVenta + totalIgv;

  let clienteParaXml = data.cliente;
  if (data.tipoComprobante === '03' && !data.cliente) {
    clienteParaXml = {
      tipoDocumento: '0',
      numeroDocumento: '00000000',
      razonSocial: 'CLIENTES VARIOS',
    };
  }

  const xmlObj = {
    Invoice: {
      '@xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
      '@xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
      '@xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
      '@xmlns:ext': 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
      
      'ext:UBLExtensions': { 'ext:UBLExtension': { 'ext:ExtensionContent': {} } },
      
      'cbc:UBLVersionID': '2.1',
      'cbc:CustomizationID': '2.0',
      'cbc:ID': `${data.serie}-${data.numero}`,
      'cbc:IssueDate': data.fechaEmision.toISOString().split('T')[0],
      'cbc:IssueTime': data.fechaEmision.toISOString().split('T')[1].substring(0, 8),
      'cbc:InvoiceTypeCode': { '@listID': '0101', '#': data.tipoComprobante },
      'cbc:DocumentCurrencyCode': data.moneda,

      'cac:AccountingSupplierParty': { },

      ...(clienteParaXml && {
        'cac:AccountingCustomerParty': {
          'cac:Party': {
            'cac:PartyTaxScheme': {
              'cbc:RegistrationName': { '$cdata': clienteParaXml.razonSocial },
              'cbc:CompanyID': { '@schemeID': clienteParaXml.tipoDocumento, '#': clienteParaXml.numeroDocumento }
            }
          }
        }
      }),

      'cac:TaxTotal': {  },

      'cac:LegalMonetaryTotal': {
        'cbc:LineExtensionAmount': { '@currencyID': data.moneda, '#': totalValorVenta.toFixed(2) },
        'cbc:TaxInclusiveAmount': { '@currencyID': data.moneda, '#': totalPrecioVenta.toFixed(2) },
        'cbc:PayableAmount': { '@currencyID': data.moneda, '#': totalPrecioVenta.toFixed(2) },
      },

      'cac:InvoiceLine': itemsCalculados.map((item) => ({  }))
    },
  };

  xmlObj.Invoice['cac:AccountingSupplierParty'] = {
    'cac:Party': {
      'cac:PartyName': [{ 'cbc:Name': { '$cdata': empresa.nombreComercial } }],
      'cac:PartyTaxScheme': {
        'cbc:RegistrationName': { '$cdata': empresa.razonSocial },
        'cbc:CompanyID': { '@schemeID': '6', '#': empresa.ruc }
      }
    }
  };
  
  xmlObj.Invoice['cac:TaxTotal'] = {
    'cbc:TaxAmount': { '@currencyID': data.moneda, '#': totalIgv.toFixed(2) },
    ...(totalGravado > 0 && {
      'cac:TaxSubtotal': {
        'cbc:TaxableAmount': { '@currencyID': data.moneda, '#': totalGravado.toFixed(2) },
        'cbc:TaxAmount': { '@currencyID': data.moneda, '#': totalIgv.toFixed(2) },
        'cac:TaxCategory': {
          'cac:TaxScheme': { 'cbc:ID': '1000', 'cbc:Name': 'IGV', 'cbc:TaxTypeCode': 'VAT' }
        }
      }
    }),

  };

  xmlObj.Invoice['cac:InvoiceLine'] = itemsCalculados.map((item) => ({
    'cbc:ID': item.id,
    'cbc:InvoicedQuantity': { '@unitCode': item.unidadMedida, '#': item.cantidad },
    'cbc:LineExtensionAmount': { '@currencyID': data.moneda, '#': item.valorVenta.toFixed(2) },
    'cac:Item': {
      'cbc:Description': { '$cdata': item.descripcion },
      'cac:SellersItemIdentification': { 'cbc:ID': item.idInterno }
    },
    'cac:Price': { 'cbc:PriceAmount': { '@currencyID': data.moneda, '#': item.valorUnitario.toFixed(2) } },
    'cac:PricingReference': {
        'cac:AlternativeConditionPrice': {
            'cbc:PriceAmount': { '@currencyID': data.moneda, '#': item.precioUnitario.toFixed(2) },
            'cbc:PriceTypeCode': '01'
        }
    },
    'cac:TaxTotal': {
        'cbc:TaxAmount': { '@currencyID': data.moneda, '#': item.igv.toFixed(2) },
        'cac:TaxSubtotal': {
            'cbc:TaxableAmount': { '@currencyID': data.moneda, '#': item.valorVenta.toFixed(2) },
            'cbc:TaxAmount': { '@currencyID': data.moneda, '#': item.igv.toFixed(2) },
            'cac:TaxCategory': {
                'cbc:ID': item.tipoAfectacionIgv === '10' ? 'S' : (item.tipoAfectacionIgv === '20' ? 'E' : 'O'),
                'cbc:TaxExemptionReasonCode': item.tipoAfectacionIgv,
                'cac:TaxScheme': {
                    'cbc:ID': item.tipoAfectacionIgv === '10' ? '1000' : (item.tipoAfectacionIgv === '20' ? '9997' : '9998'),
                    'cbc:Name': item.tipoAfectacionIgv === '10' ? 'IGV' : (item.tipoAfectacionIgv === '20' ? 'EXO' : 'INA'),
                    'cbc:TaxTypeCode': item.tipoAfectacionIgv === '10' ? 'VAT' : 'FRE'
                }
            }
        }
    }
  }));

  return create({ Invoice: xmlObj.Invoice }).end({ prettyPrint: true });
}