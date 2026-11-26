type TextDecoderConstructor = new (label?: string, options?: TextDecoderOptions) => TextDecoder;

const objetoGlobal = globalThis as typeof globalThis & {
  TextDecoder?: TextDecoderConstructor;
};

const TextDecoderNativo = objetoGlobal.TextDecoder;

if (TextDecoderNativo) {
  class TextDecoderCompatible extends TextDecoderNativo {
    private readonly usaAscii: boolean;

    constructor(label?: string, options?: TextDecoderOptions) {
      const etiqueta = label?.trim().toLowerCase().replace(/_/g, '-');
      super(etiqueta === 'ascii' || etiqueta === 'us-ascii' ? 'utf-8' : label, options);
      this.usaAscii = etiqueta === 'ascii' || etiqueta === 'us-ascii';
    }

    decode(input?: AllowSharedBufferSource, options?: TextDecodeOptions): string {
      if (!this.usaAscii || input == null) {
        return super.decode(input, options);
      }

      const bytes = ArrayBuffer.isView(input)
        ? new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
        : new Uint8Array(input as ArrayBufferLike);

      // pdfmake usa ASCII para estructuras binarias de PDF. Mantener cada
      // byte como un carácter evita que la conversión UTF-8 altere los datos.
      let resultado = '';
      for (let indice = 0; indice < bytes.length; indice += 1) {
        resultado += String.fromCharCode(bytes[indice]);
      }
      return resultado;
    }
  }

  objetoGlobal.TextDecoder = TextDecoderCompatible;
}
