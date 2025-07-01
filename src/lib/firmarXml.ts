import { SignedXml } from 'xml-crypto';
import forge from 'node-forge';

/**
 * Firma un XML UBL con XAdES-BES compatible con SUNAT
 * @param xmlString - XML a firmar
 * @param privateKeyPem - clave privada en PEM (clave.pem)
 * @param certPem - certificado público en PEM (cert.pem)
 * @returns XML firmado
 */
export function firmarXml(
  xmlString: string,
  privateKeyPem: string,
  certPem: string
): string {
  const signatureId = 'SignatureSUNAT';
  const signedPropsId = 'SignedProperties123';

  // Procesar certificado con forge para obtener SHA1, issuer y serial
  const cert = forge.pki.certificateFromPem(certPem);
  const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
  const sha1Hex = forge.md.sha1.create().update(der).digest().toHex();
  const sha1Base64 = Buffer.from(forge.util.hexToBytes(sha1Hex), 'binary').toString('base64');
  const issuer = cert.issuer.attributes.map(attr => `${attr.shortName}=${attr.value}`).join(',');
  const serial = new forge.jsbn.BigInteger(cert.serialNumber, 16).toString();

  const signer = new SignedXml();
  signer.signingKey = privateKeyPem;
  signer.signatureAlgorithm = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1';
  signer.canonicalizationAlgorithm = 'http://www.w3.org/2001/10/xml-exc-c14n#';

  // Solo referencia al documento raíz
  signer.addReference(
    "/*",
    [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/2001/10/xml-exc-c14n#'
    ],
    'http://www.w3.org/2000/09/xmldsig#sha1'
  );

  // Limpia cualquier espacio antes del primer <
  const xmlSinFirmaLimpio = xmlString.replace(/^[\s\uFEFF\xA0]+/g, '');
  console.log('XML que se va a firmar:\n', xmlSinFirmaLimpio);

  signer.computeSignature(xmlSinFirmaLimpio, {
    prefix: 'ds',
    location: {
      reference: "//*[local-name()='ExtensionContent']",
      action: 'append'
    },
  });

  const xades = `
<ds:Object xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
  <xades:QualifyingProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Target="#${signatureId}">
    <xades:SignedProperties Id="${signedPropsId}">
      <xades:SignedSignatureProperties>
        <xades:SigningTime>${new Date().toISOString()}</xades:SigningTime>
        <xades:SigningCertificate>
          <xades:Cert>
            <xades:CertDigest>
              <ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
              <ds:DigestValue>${sha1Base64}</ds:DigestValue>
            </xades:CertDigest>
            <xades:IssuerSerial>
              <ds:X509IssuerName>${issuer}</ds:X509IssuerName>
              <ds:X509SerialNumber>${serial}</ds:X509SerialNumber>
            </xades:IssuerSerial>
          </xades:Cert>
        </xades:SigningCertificate>
      </xades:SignedSignatureProperties>
    </xades:SignedProperties>
  </xades:QualifyingProperties>
</ds:Object>`;

  return signer.getSignedXml().replace('</ds:Signature>', `${xades}</ds:Signature>`);
}
