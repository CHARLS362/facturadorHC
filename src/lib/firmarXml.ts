import { SignedXml } from 'xml-crypto';
import fs from 'fs';

/**
 * @param xmlString - 
 * @param certificate - 
 * @param certificatePassword - 
 * @returns 
 */
export function firmarXml(
  xmlString: string,
  certificate: Buffer,
  certificatePassword: string
): string {
  const signer = new SignedXml({
    privateKey: {
      key: certificate,
      passphrase: certificatePassword,
    },
    signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
    canonicalizationAlgorithm: 'http://www.w3.org/2001/10/xml-exc-c14n#',
  });


  const xpath = "//*[local-name(.)='ExtensionContent']";
  

  signer.addReference({
    xpath: "/*",
    transforms: [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/2001/10/xml-exc-c14n#'
    ],
    digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256',
  });


  signer.computeSignature(xmlString, {
    prefix: 'ds', 
    location: {
      reference: xpath,
      action: 'append', 
    },
  });

  
  return signer.getSignedXml();
}