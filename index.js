'use strict';
const line = require('@line/bot-sdk');
const express = require('express');
var request = require("request");
const instaProf = require('instagram-basic-data-scraper-with-username');
const mista = require('mista');
const instaDown = require('instagram-downloader');

// create LINE SDK config from env variables
const config = {
   channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
   channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express: https://expressjs.com/
const app = express();

app.get('/', (req, res) => {
    res.send('Res send!');
  });
  
  // register a webhook handler with middleware
  // about the middleware, please refer to doc
  app.post('/webhook', line.middleware(config), (req, res) => {
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
  });
  
  // simple reply function
	const replyText = (token, texts) => {
		texts = Array.isArray(texts) ? texts : [texts];
		return client.replyMessage(
			token,
			texts.map((text) => ({ type: 'text', text }))
	);
	};
	// Reply yg asli:
	// return client.replyMessage(event.replyToken, tutorVid);

    function checkBio(value){
        if(value){
            while(value.includes("\\")){
                value = value.replace("\\n","\n");
                value = value.replace('\\"','\"');
                value = value.replace("\\'","\'");    
            }
            return value;
        } else {
            return '-';
        }
    }

    //Bio IG
    function bioIG(token, igid){
            const p1 = instaProf.getFullname(igid);
            const p2 = instaProf.getBio(igid);
            const p3 = instaProf.getPosts(igid);
            const p4 = instaProf.getFollowers(igid);
            const p5 = instaProf.getFollowing(igid);
            const p6 = instaProf.getExternalUrl(igid);
            Promise.all([p1,p2,p3,p4,p5,p6]).then(function(values){
                console.log(values);
                const fullName = (values[0].data)? values[0].data : '-';
                const igbio = checkBio(values[1].data);
                const iglink = (values[5].data)? values[5].data : '-';
                const sendBio = "𝐍𝐚𝐦𝐚: "+ fullName +"\n𝐁𝐢𝐨:\n"+ igbio + "\n𝐏𝐨𝐬𝐭𝐬: "+ values[2].data +"\n𝐅𝐨𝐥𝐥𝐨𝐰𝐞𝐫𝐬: "+ values[3].data +"\n𝐅𝐨𝐥𝐥𝐨𝐰𝐢𝐧𝐠: "+ values[4].data +"\n𝐋𝐢𝐧𝐤: "+ iglink;
                return replyText(token, sendBio);    
            })
    }

    // Profil IG
    function profilIG(token, igid){
	    const p1 = instaProf.instaRegular(igid);
        const p2 = instaProf.instaHighDefinition(igid);
        
        Promise.all([p1,p2]).then(function(values){
            console.log(values);
            return client.replyMessage(token, {
                type: "image", originalContentUrl: values[1], previewImageUrl: values[0]
            });    
        })
    }


    // Foto Vid IG
    function instamedurl(token, igid){
        const p1 = instaDown(igid).then(data => {
            const { entry_data: { PostPage } } = data;
            console.log(data);
            return PostPage.map(post => post.graphql.shortcode_media)
        })
        Promise.all([p1]).then(function(values){
            console.log(values[0][0]);
            return client.replyMessage(token, {
                type: "image", originalContentUrl: values[0][0], previewImageUrl: values[0][0]
            });
        })
    }

  // event handler
  function handleEvent(event) {
     
     //  Chats
    const sendHelp 		= "𝙍𝙀:𝘽𝙊𝙏 dapat melakukan beberapa hal loh...\nCoba yuk command-command 𝙍𝙀:𝘽𝙊𝙏 berikut ini!\n\n\n/𝐡𝐞𝐥𝐩 - Untuk melihat command yang kami punya\n/𝐯𝐢𝐝𝐞𝐨𝐢𝐠 - Untuk menyimpan video dari instagram\n/𝐟𝐨𝐭𝐨𝐢𝐠 - Untuk menyimpan foto dari instagram\n/𝐜𝐚𝐩𝐭𝐢𝐨𝐧𝐢𝐠 - Untuk mengecek caption dari post di instagram\n/𝐛𝐢𝐨𝐢𝐠 - Untuk mengecek bio profil instagram\n/𝐩𝐫𝐨𝐟𝐢𝐥𝐢𝐠 - Untuk mengecek foto profil instagram\n/𝐬𝐭𝐨𝐫𝐲𝐢𝐠 - Untuk menyimpan foto atau video dari instastory\n/𝐚𝐛𝐨𝐮𝐭 - Untuk mengetahui lebih lanjut tentang 𝙍𝙀:𝘽𝙊𝙏\n\n\n\u2665";
    const tutorFoto	 	= "Begini nih cara menggunakan commandnya\n\n/fotoig (link post instagram)";
    const tutorVid 		= "Begini nih cara menggunakan commandnya\n\n/videoig (link post instagram)";
    const tutorStory 	= "Begini nih cara menggunakan commandnya\n\n/storyig (username instagram)";
    const tutorCaption 	= "Begini nih cara menggunakan commandnya\n\n/captionig (link post instagram)";
    const tutorCek 		= "Begini nih cara menggunakan commandnya\n\n/bioig (username instagram)";
    const tutorPP 		= "Begini nih cara menggunakan commandnya\n\n/profilig (username instagram)";
    const errormess 	= "Terima kasih atas pesannya\nSayang sekali, akun ini masih goblok";
    const sendIntro 	=  "𝙍𝙀:𝘽𝙊𝙏 dapat melakukan beberapa hal loh..\nCoba yuk!\nKetik /help untuk melihat command-command yang kami punya.\n\n\u2605";
    const aboutMe 		= "𝙍𝙀:𝘽𝙊𝙏 adalah adalah chatbot yang dapat membantumu menyimpan foto maupun video dari Instagram.\n\n𝙍𝙀:𝘽𝙊𝙏 dibuat oleh:\n- [2201801636] Hans Nugroho Gianto Hadiwijaya\n- [2201758285] Casandra\n- [2201787915] Mita\n\n\n\uD83C\uDF6C";
    const sendHello 	= "Welcome to 𝙍𝙀:𝘽𝙊𝙏!\n\n𝙍𝙀:𝘽𝙊𝙏 dapat melakukan beberapa hal loh..\nCoba yuk!\nKetik /help untuk melihat command-command yang kami punya.";


	if (event.type === 'follow'){
		return replyText(event.replyToken, sendHello);
	} else if (event.type !== 'message' || event.message.type !== 'text') {
      // ignore non-text-message event
      return replyText(event.replyToken, sendIntro);
    } else {
        const receivedMessage = event.message.text;
        if (receivedMessage.split(" ").length === 2){
            const splittedText = receivedMessage.split(" ");
            const inicommand = splittedText[0];
            const link = splittedText[1];
            switch (inicommand) {
                case '/videoig':
                    return instamedurl(event.replyToken, link);
                    break;
                case '/fotoig':
                    return instamedurl(event.replyToken, link);
                    break;
                case '/captionig':
                    return replyText(event.replyToken, tutorCaption);
                    break;
                case '/storyig':
                    return replyText(event.replyToken, tutorStory);
                    break;
                case '/bioig':
                    return bioIG(event.replyToken, link);
                    break;
                case '/profilig':
                    return profilIG(event.replyToken, link);
                    break;
        		case '/echo':
        		    return replyText(event.replyToken, link);
        		    break;
                default:
                    return replyText(event.replyToken, errormess);
                    break;
            }
        } else {
            switch (receivedMessage) {
                case '/help':
                    return replyText(event.replyToken, sendHelp);
                    break;
                case '/videoig':
                    return replyText(event.replyToken, tutorVid);
                    break;
                case '/fotoig':
                    return replyText(event.replyToken, tutorFoto);
                    break;
                case '/captionig':
                    return replyText(event.replyToken, tutorCaption);
                    break;
                case '/storyig':
                    return replyText(event.replyToken, tutorStory);
                    break;
                case '/bioig':
                    return replyText(event.replyToken, tutorCek);
                    break;
                case '/profilig':
                    return replyText(event.replyToken, tutorPP);
                    break;
                case '/about':
                    return replyText(event.replyToken, aboutMe);
                    break;
                default:
                    return replyText(event.replyToken, sendIntro);
                    break;
            }
        }
  }
  }  
  // listen on port
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on ${port}`);
  });
