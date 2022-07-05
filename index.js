const puppeteer = require('puppeteer');
const fs = require('fs');
const PDFGenerator = require('pdfkit')
const timeElapsed = Date.now();
const today = new Date(timeElapsed);

let todayDDMMYYYY = today.toLocaleDateString();

let jobsPDF = new PDFGenerator;

const sgMail = require('@sendgrid/mail');



(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://araras.sp.gov.br/pat/');
  const filterBar = 'input[type=search]';
  await page.click(filterBar);
  await page.$eval(filterBar, el => el.value = 'geral')
  await page.keyboard.press("Enter");

  const jobList = await page.evaluate(() => {

    const nodeList = document.querySelectorAll('table tr td');
    const jobArray = [...nodeList];
    
    const jobList = jobArray.map(td => td.innerText + (td.innerHTML = "--------//"));

    return jobList.join('--------');
  })  


  jobsPDF.pipe(fs.createWriteStream('Vagas.pdf'));

  jobsPDF.text('Vagas do PAT!', {
    align: 'center'
  });

  jobsPDF.text(`Dia: ${todayDDMMYYYY}`, {
    align: 'center'
  })

  jobsPDF.moveDown(5);


  jobsPDF.text(jobList);

  jobsPDF.moveDown(5);

  jobsPDF.text("clique aqui para acessar o Site do Pat!", {
    link: 'https://araras.sp.gov.br/pat/'
  })

  jobsPDF.end();

  console.log('Arquivo gerado com sucesso!')

  let newPath = './Vagas.pdf';

  sgMail.setApiKey("YOUR_API_KEY");
    let fileToBeSended = newPath;
    let attachment = fs.readFileSync(fileToBeSended).toString("base64");
    
    const msg = {
        to: 'TO_EMAIL',
        from: 'FROM_EMAIL',
        subject: `Vagas PAT - ${todayDDMMYYYY}`,
        text: `Vagas do PAT Araras referentes a: geral!`,
        attachments: [
            {
              content: attachment,
              filename: "Vagas PAT.pdf",
              type: "application/pdf",
              disposition: "attachment"
            }
          ]
    };
    
    await sgMail.send(msg).catch(err => {
        console.log(err)
    });

  await browser.close();
})();

//TODO GERAL: formatar o conteúdo do PDF de maneira mais eficaz