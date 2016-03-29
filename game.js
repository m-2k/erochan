function initGame2() {
    m = new Music({
        trackList: ['my-soul','camp_center_day'],
        fileExtension: 'mp4'
    });
};

function initGame() {
    
    m = new Music({
        trackList: ['camp_center_day'],
        fileExtension: 'mp4'
    });
    
    bg = new Scene({name:'bg1',
        fileDirectory: 'bg',
        // locationList:['ext-beach','ext-clubs', 'int-catacombs','int-bus','int-liaz','int-library','ext-polyana'],
        locationList:['ext-polyana'],
        sectionList:[undefined,'entrance','hole','living'],
        timeList:['day','night','sunset'],
        matterList:['nus','sus']});
        
    cg = new Scene({name:'cg1',
        fileDirectory: 'cg',
        locationList:['d1'],
        sectionList:['rowrow'],
        timeList:[],
        matterList:[]});
    
    me = new Sprite({ name: 'me', personName: 'Семён'});
    un = new Sprite({
        name: 'un',
        // fileDirectory: 'sprites/un',
        personName: 'Лена',
        bodyList: ['1', '2', '3'],
        faceList: ['angry', 'cry', 'evil', 'grin', 'laugh', 'normal', 'rage', 'sad', 'scared', 'serious', 'shocked', 'shy', 'smile', 'surprise'],
        wearList: ['dress', 'pioneer', 'sport', 'swim'] // swim missing for body3
    });
    D && console.log(un.valueOf());
    
    dv = new Sprite({
        name: 'dv',
        // fileDirectory: 'sprites/dv',
        personName: 'Алиса',
        bodyList: ['1', '2', '3', '4', '5'],
        faceList: ['angry', 'cry', 'grin', 'guilty', 'laugh', 'normal', 'rage', 'sad', 'scared', 'shocked', 'shy', 'smile', 'surprise'],
        wearList: ['pioneer', 'pioneer2', 'swim']
    });
    D && console.log(dv.valueOf());
    
    mt = new Sprite({
        name: 'mt',
        // fileDirectory: 'sprites/mt',
        personName: 'Ольга Дмитриевна',
        bodyList: ['1', '2', '3'],
        faceList: ['angry', 'grin', 'laugh', 'normal', 'rage', 'sad', 'smile', 'surprise'],
        wearList: ['dress', 'pioneer', 'swim', 'panama']
    });
    D && console.log(mt.valueOf());
    
    sl = new Sprite({
        name: 'sl',
        // fileDirectory: 'sprites/sl',
        personName: 'Славя',
        bodyList: ['1', '2', '3', '4'],
        faceList: ['angry', 'happy', 'laugh', 'normal', 'sad', 'scared', 'serious', 'smile', 'shy', 'surprise', 'tender'],
        wearList: ['dress', 'pioneer', 'sport', 'swim']
    });
    D && console.log(sl.valueOf());
    
    as = new ActionSelector({name: 'sel-1'});
    
    // variable list
    lp_dv = 6;
    lp_un = 5;
};

function startGame() {
    // return ii_eroge_d1;
    
    // as.select({actions: [
    //     {text: "Начать игру", next: episode1},
    //     {text: "ii_eroge_d1", next: ii_eroge_d1},
    //     {text: "Меню 2"},
    //     {text: "Меню 3"},
    //     {text: "Меню 4"},
    //     {text: "Меню 5"}
    // ]});
    m.play().now();
    me.narration('День 5 — Ревность').next(jealousy);
};

function jealousy() {
    bg.loc('ext-polyana').time('sunset').show().fade();
    me.narration("Наконец Ольга Дмитриевна решила, что пора заканчивать наши хождения по мукам.").next(function() {
        mt.show().body('1').face('normal').wear('pioneer').pos('center').fade();
        mt.say('Здесь сделаем привал.').next(function() {
            mt.hide().fade();
            me.narration('Мы находились на довольно большой поляне, на которой лежало полукругом несколько деревьев,\nобразуя что-то вроде импровизированной беседки, посредине которой земля была\nвыжжена и валялись угли от костра.').next(function() {
            me.narration('По всему было заметно, что такие походы были традиционными\nдля этого лагеря.').next(function() {
            me.narration('Меня вместе с остальными парнями отправили на поиски дров.').next(function() {
            me.narration('Это занятие оказалось несложным, так как вокруг\nвалялось большое количество веток и бревен разного размера.').next(function() {
            me.narration('В конце концов, с помощью каких-то газет Ольга Дмитриевна\nразожгла костер.').next(function() {
            me.narration('Мне было очень интересно почитать, что в них пишут,\nно ничего, кроме советской символики, я разглядеть не смог.').next(function() {
            me.narration('Пионеры расселись на бревнах и начали говорить кто о чем.').next(function() {
            me.narration('Похоже, конечная цель всего этого мероприятия была достигнута.').next(function() {
                me.think('Не хватает только котелка с ухой, алюминиевых чашек с водкой и гитары.').next(function() {
                    me.narration('Впрочем, я бы не удивился, если бы и все это откуда-нибудь здесь появилось.').next(function() {
                        sl.show().body('3').wear('pioneer').face('surprise').pos('center').fade();
                        sl.say('О чем думаешь?').next(function() {
                            me.narration('Ко мне подсела Славя.').next(function() {
                                me.say('Да так, ни о чем…{w} Наслаждаюсь походом.').next(function() {
                                    me.narration('Съязвил я.').next(function() {
                                        sl.say('Ясно.').next(function() {
                                            sl.hide().fade();
                                            me.narration('Она еще некоторое время посидела рядом, но, поняв, что я не очень настроен разговаривать, ушла.').next(function() {
                                            me.narration('Единственным, что мне хотелось сейчас, было поскорее улечься в постель\nи заснуть, но вместо этого я все больше пропитывался дымом от костра и\nпустой болтовней окружающих.').next(function() {
                                            me.narration('Я принялся наблюдать за пионерами.{w} Все веселились, смеялись,\nв общем, наслаждались теплым летним вечером.').next(function() {
                                            me.narration('В дальнем конце поляны я увидел Лену, которая о чем-то оживленно спорила с Алисой.').next(function() {
                                            me.narration('«Оживленно» и Лена – понятия несовместимые, так мне казалось.').next(function() {
                                            me.narration('Славя, похоже, после разговора со мной куда-то ушла.').next(function() {
                                            me.narration('Электроник с Шуриком что-то яростно доказывали Ольге Дмитриевне.').next(function() {
                                            me.narration('Кажется, только я был лишним на этом празднике жизни.').next(function() {
                                                as.select({actions: [
                                                    {text: 'Поинтересоваться спором Лены и Алисы', next: function() {
                                                        if(lp_dv >= 6 && lp_un < 6) { jealousy_dv(); }
                                                        else if(lp_dv < 6 && lp_un >= 6) { jealousy_un(); }
                                                        else { me.think('Хотя, с другой стороны, какая разница?').next(jealousy_pass); }
                                                    }},
                                                    {text: "Не делать ничего, просто сидеть и сычевать", next: jealousy_pass},
                                                ]});
                                            })})})})})})})})
                                        })
                                    })
                                })
                            })
                        })
                    })
                })

            })})})})})})})})
        })
    })
};

function jealousy_dv() {
    me.narration('Из всего благолепия выбивались только Лена и Алиса.').next(function(){
    me.narration('Нет, само по себе то, что Алиса с кем-то ссорится, было абсолютно естественным.').next(function(){
    me.narration('Но Лена, разговаривающая на повышенных тонах…').next(function(){
    me.narration('Я аккуратно подошел поближе, пытаясь понять, что происходит.').next(function(){
        dv.body('5').face('angry').wear('pioneer').pos('left').now().show().fade();
        un.body('1').face('angry').wear('pioneer').pos('right').now().show().fade();
        dv.say('Нет, это ты меня послушай!').next(function() {
        un.say('Думай, как хочешь, я уже все сказала!').next(function() {
        me.think('Похоже, дело серьезное.').next(function() {
        me.narration('Я старался, как мог, не привлекать внимания и делать вид,\nчто просто стою рядом, не интересуясь их разговором.').next(function() {
        dv.say('Тут ничего и думать не надо – все и так видно!').next(function() {
        dv.say('Рассказывай кому-нибудь другому, кто не так хорошо тебя знает.').next(function() {
        un.say('Да, ты все знаешь! Что же сама тогда ему не скажешь?').next(function() {
        me.narration('Лена злилась.{w} Одно это уже было в высшей степени странно,\nдаже учитывая то, что я не знал предмета спора.').next(function() {
        dv.say('А вот это уже не твое дело!').next(function() {
            dv.body('1').face('surprise').fade();
            me.narration('Алиса фыркнула, отвернулась от нее и встретилась глазами со мной.').next(function() {
                un.face('normal').fade();
                me.narration('Через секунду посмотрела на меня и Лена.').next(function() {
                me.narration('Некоторое время девочки стояли в растерянности.').next(function() {
                    dv.body('5').face('rage').fade();
                    un.face('normal').fade();
                    dv.say('А ты…{w} Подслушиваешь?!').next(function() {
                    me.say('Я?{w} Нет-нет! Просто мимо крокодил… проходил.').next(function() {
                        
                    })})
            })})})
        })})})})})})})})})
    })})})})
};
function jealousy_un() { };
function jealousy_pass() { Api.end(); };

