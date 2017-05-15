class Link {
  constructor(url, text) {
    this.url = url;
    this.text = text;
  }

  async toString() {
    const text = await this.text.toString();
    return text;
  }

  async slack() {
    const text = await this.text.toString();
    return `<${this.url}|${text}>`;
  }
}

module.exports = Link;
