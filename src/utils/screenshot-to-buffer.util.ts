import puppeteer from 'puppeteer';

export const screenshotToBuffer = async (
  compiledHTML: string,
  width: number,
  height: number,
) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
    defaultViewport: {
      width: Math.ceil(width),
      height: Math.ceil(height),
    },
  });

  const page = await browser.newPage();
  await page.setContent(compiledHTML);

  const pdf = await page.pdf({ width, height });
  await browser.close();

  return pdf;
};
