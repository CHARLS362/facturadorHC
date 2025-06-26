import { create } from 'xmlbuilder2';

export interface Empresa {
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
}

export interface Cliente {
  tipoDocumento: '1' | '4' | '6' | '7' | '0';
  numeroDocumento: string;
  razonSocial: string;
}

export interface VentaItem {
  IdProducto: number;
  NombreProducto: string;
  Cantidad: number;
  PrecioUnitario: number;
  Total: number;
}

export interface Venta {
  serie: string;
  numero: string;
  fecha: Date;
  total: number;
  moneda: 'PEN' | 'USD';
  items: VentaItem[];
}

export interface FacturaData {
  empresa: Empresa;
  cliente: Cliente;
  venta: Venta;
}

interface ItemCalculado extends VentaItem {
  Id: number;
  ValorUnitario: number;
  PrecioUnitarioConIgv: number;
  SubtotalSinIgv: number;
  IgvItem: number;
}


export function generarXml(data: FacturaData): string {
  const { empresa, cliente, venta } = data;
  const IGV_RATE = 0.18;

  const totalConIgv = venta.total;
  const totalSinIgv = parseFloat((totalConIgv / (1 + IGV_RATE)).toFixed(2));
  const totalIgv = parseFloat((totalConIgv - totalSinIgv).toFixed(2));

  const itemsCorregidos: ItemCalculado[] = venta.items.map((item, i) => {
    const precioUnitarioConIgv = item.PrecioUnitario;
    const valorUnitarioSinIgv = parseFloat((precioUnitarioConIgv / (1 + IGV_RATE)).toFixed(2));
    const subtotalConIgv = item.Total;
    const subtotalSinIgv = parseFloat((subtotalConIgv / (1 + IGV_RATE)).toFixed(2));
    const igvItem = parseFloat((subtotalConIgv - subtotalSinIgv).toFixed(2));

    return {
      ...item,
      Id: i + 1,
      ValorUnitario: valorUnitarioSinIgv,
      PrecioUnitarioConIgv: precioUnitarioConIgv,
      SubtotalSinIgv: subtotalSinIgv,
      IgvItem: igvItem,
    };
  });

  const xmlObj = {
    Invoice: {
      '@xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
      '@xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
      '@xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
      '@xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
      '@xmlns:ext': 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
      
      'ext:UBLExtensions': {
        'ext:UBLExtension': {
          'ext:ExtensionContent': {}
        }
      },
      
      'cbc:UBLVersionID': '2.1',
      'cbc:CustomizationID': '2.0',
      'cbc:ID': `${venta.serie}-${venta.numero}`,
      'cbc:IssueDate': venta.fecha.toISOString().split('T')[0],
      'cbc:IssueTime': venta.fecha.toISOString().split('T')[1].substring(0, 8),
      'cbc:InvoiceTypeCode': { '@listID': '0101', '#': '01' },
      'cbc:DocumentCurrencyCode': venta.moneda,

      'cac:AccountingSupplierParty': {
        'cac:Party': {
          'cac:PartyIdentification': { 'cbc:ID': { '@schemeID': '6', '#': empresa.ruc } },
          'cac:PartyName': { 'cbc:Name': { '$cdata': empresa.nombreComercial } },
          'cac:PartyLegalEntity': {
            'cbc:RegistrationName': { '$cdata': empresa.razonSocial },
            'cac:RegistrationAddress': { 'cbc:AddressTypeCode': '0000' }
          }
        },
      },

      'cac:AccountingCustomerParty': {
        'cac:Party': {
          'cac:PartyIdentification': { 'cbc:ID': { '@schemeID': cliente.tipoDocumento, '#': cliente.numeroDocumento } },
          'cac:PartyLegalEntity': {
            'cbc:RegistrationName': { '$cdata': cliente.razonSocial }
          },
        },
      },

      'cac:TaxTotal': {
        'cbc:TaxAmount': { '@currencyID': venta.moneda, '#': totalIgv.toFixed(2) },
        'cac:TaxSubtotal': {
          'cbc:TaxableAmount': { '@currencyID': venta.moneda, '#': totalSinIgv.toFixed(2) },
          'cbc:TaxAmount': { '@currencyID': venta.moneda, '#': totalIgv.toFixed(2) },
          'cac:TaxCategory': {
            'cac:TaxScheme': { 'cbc:ID': '1000', 'cbc:Name': 'IGV', 'cbc:TaxTypeCode': 'VAT' },
          },
        },
      },

      'cac:LegalMonetaryTotal': {
        'cbc:LineExtensionAmount': { '@currencyID': venta.moneda, '#': totalSinIgv.toFixed(2) },
        'cbc:PayableAmount': { '@currencyID': venta.moneda, '#': totalConIgv.toFixed(2) },
      },

      'cac:InvoiceLine': itemsCorregidos.map((item: ItemCalculado) => ({
        'cbc:ID': item.Id,
        'cbc:InvoicedQuantity': { '@unitCode': 'NIU', '#': item.Cantidad },
        'cbc:LineExtensionAmount': { '@currencyID': venta.moneda, '#': item.SubtotalSinIgv.toFixed(2) },
        'cac:Item': {
          'cbc:Description': { '$cdata': item.NombreProducto }
        },
        'cac:Price': { 'cbc:PriceAmount': { '@currencyID': venta.moneda, '#': item.ValorUnitario.toFixed(2) } },
        'cac:PricingReference': {
            'cac:AlternativeConditionPrice': {
                'cbc:PriceAmount': { '@currencyID': venta.moneda, '#': item.PrecioUnitarioConIgv.toFixed(2) },
                'cbc:PriceTypeCode': '01'
            }
        },
        'cac:TaxTotal': {
            'cbc:TaxAmount': { '@currencyID': venta.moneda, '#': item.IgvItem.toFixed(2) },
            'cac:TaxSubtotal': {
                'cbc:TaxableAmount': { '@currencyID': venta.moneda, '#': item.SubtotalSinIgv.toFixed(2) },
                'cbc:TaxAmount': { '@currencyID': venta.moneda, '#': item.IgvItem.toFixed(2) },
                'cac:TaxCategory': {
                    'cbc:ID': { '@schemeID': 'UN/ECE 5305', '#': 'S' },
                    'cac:TaxScheme': {
                        'cbc:ID': { '@schemeID': 'UN/ECE 5153', '@schemeAgencyID': '6', '#': '1000' },
                        'cbc:Name': 'IGV',
                        'cbc:TaxTypeCode': 'VAT',
                    }
                }
            }
        }
      })),
    },
  };

  return create(xmlObj).end({ prettyPrint: true });
}
