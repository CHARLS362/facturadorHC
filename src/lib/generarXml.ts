import { create } from 'xmlbuilder2';

export function generarXml(data: any): string {
  const { empresa, cliente, venta } = data;

  const xmlObj = {
    Invoice: {
      '@xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
      '@xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
      '@xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
      'cbc:UBLVersionID': '2.1',
      'cbc:CustomizationID': '2.0',
      'cbc:ID': `${venta.serie}-${venta.numero}`,
      'cbc:IssueDate': new Date(venta.fecha).toISOString().split('T')[0],
      'cbc:DocumentCurrencyCode': venta.moneda,

      'cac:AccountingSupplierParty': {
        'cac:Party': {
          'cac:PartyIdentification': {
            'cbc:ID': { '@schemeID': '6', '#': empresa.ruc },
          },
          'cac:PartyName': {
            'cbc:Name': empresa.nombreComercial,
          },
        },
      },

      'cac:AccountingCustomerParty': {
        'cac:Party': {
          'cac:PartyIdentification': {
            'cbc:ID': {
              '@schemeID': cliente.tipoDocumento,
              '#': cliente.numeroDocumento,
            },
          },
          'cac:PartyLegalEntity': {
            'cbc:RegistrationName': cliente.razonSocial,
          },
        },
      },

      'cac:TaxTotal': {
        'cbc:TaxAmount': {
          '@currencyID': venta.moneda,
          '#': (venta.total * 0.18).toFixed(2),
        },
        'cac:TaxSubtotal': {
          'cbc:TaxAmount': {
            '@currencyID': venta.moneda,
            '#': (venta.total * 0.18).toFixed(2),
          },
          'cac:TaxCategory': {
            'cac:TaxScheme': {
              'cbc:ID': '1000',
              'cbc:Name': 'IGV',
              'cbc:TaxTypeCode': 'VAT',
            },
          },
        },
      },

      'cac:LegalMonetaryTotal': {
        'cbc:PayableAmount': {
          '@currencyID': venta.moneda,
          '#': venta.total.toFixed(2),
        },
      },

      'cac:InvoiceLine': venta.items.map((item: any, i: number) => ({
        'cbc:ID': i + 1,
        'cbc:InvoicedQuantity': {
          '@unitCode': 'NIU',
          '#': item.Cantidad,
        },
        'cbc:LineExtensionAmount': {
          '@currencyID': venta.moneda,
          '#': item.Total.toFixed(2),
        },
        'cac:Item': {
          'cbc:Description': item.NombreProducto,
        },
        'cac:Price': {
          'cbc:PriceAmount': {
            '@currencyID': venta.moneda,
            '#': item.PrecioUnitario.toFixed(2),
          },
        },
      })),
    },
  };

  return create(xmlObj).end({ prettyPrint: true });
}
