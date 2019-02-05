module.exports = {
    name : 'Minigames Bot',
    version : '0.6.1',
    creatorID : '242975403512168449',
    zzigerID: '421030089732653057',
    artemCordId: '447019894735634432',
    prefix : '/',
    channels: {
        serverLeaveJoin: '518702056031125505',
        commandsUsing: '518702056031125505',
        bugsIdeas: '518702056031125505',
        stats: '539737874032230437',
    },
    updates : {
        '0.1.0' : ['На мoмент создания бота были команды /countries, /rsp, /help, /idea, /bug и /creator'],
        '0.2.0' : ['Добавлена команда /capitals'],
        '0.3.0' : ['Добавлена команда /ttt', 'Добавлена возможность выбирать уровень сложности в командах /capitals и /countries'],
        '0.3.1' : ['Крестики-нолики (/ttt) стали намного умнее', 'Были добавлены команды /update и /rand'],
        '0.3.2' : ['Дизайн команды /ttt был изменен с черно-белого на радужный, на клетках появились цифры', 'Теперь когда вы делаете ход в /ttt, то бот вас упоминает, чтобы не было путаницы', 'Изменены фразы после проигрыша/выигрыша в /ttt'],
        '0.4.0' : ['В /ttt теперь можно играть с другом', 'Добавлена возможность выбирать кто пойдет первым в /ttt'],
        '0.5.0' : ['Добавлена команда /seabattle (морской бой)'],
        '0.6.0' : ['Была убрана команда /seabattle из-за перегрузок', 'Был изменен дизай команды /help', 'Добавлены команды /cmd-info `<Название команды>` и /info', 'Крестики-нолики теперь не засоряют чат', '*Пссс, еще был добавлен донат, /donate, только никому не говори!*'],
        '0.6.1' : ['Была добавлена команда /used, которая позволяет просматривать какие команды чаще используют', 'Функция, которая отправляет информацию о том где и кто использует команды была улучшена ~~(чтобы это увидеть, то нужно прийти к нам на серве...)~~', 'Теперь, каждому репорту бага или идеи присваивается уникальный ID, чтобы на них было легче отвечать']
    },
    updatesList : ['0.1.0', '0.2.0', '0.3.0', '0.3.1', '0.3.2', '0.4.0', '0.5.0', '0.6.0', '0.6.1'],
    colors : {
        discord : '36393F',
        green : '55ff55',
        red : 'ff5555',
        yellow : 'ffff00',
        main : 'af00ff'
    },
    emojis : {
        yoba : '522739254825058304',
        rock : '522738393566937089',
        typing : '526365694183342087',

        whitePawn : '527399844093100042',
        whiteHourse : '527399872521961482',
        whiteEleph : '527399891962691584',
        whiteLadya : '527399926838067200',
        whiteFerz : '527399969469235200',
        whiteKing : '527400008144650280',

        blackPawn : '527400035776856065',
        blackHourse : '527400068345626625',
        blackEleph : '527400077363511296',
        blackLadya : '527400087299817484',
        blackFerz : '527400003105107828',
        blackKing : '527400109890207755'
    },
    images : {
        circle: 'https://cdn.discordapp.com/attachments/492028926919573506/540953553523703808/circle.png',
        bg: 'https://cdn.discordapp.com/attachments/492028926919573506/540957076508114944/background.png',

        ttt : {
            field : 'https://cdn.discordapp.com/attachments/524159437464797184/526470580115996672/tttField.png',
            cross : 'https://cdn.discordapp.com/attachments/524159437464797184/526470512310878208/cross.png',
            circle : 'https://cdn.discordapp.com/attachments/524159437464797184/526470469092769793/circle.png'
        },

        sb : {
            field : 'https://cdn.discordapp.com/attachments/524159437464797184/526470930721931265/seabattleField.png',
            ship : 'https://cdn.discordapp.com/attachments/524159437464797184/526470967237672960/ship.png',
            cross : 'https://cdn.discordapp.com/attachments/524159437464797184/526471033104891905/redCross.png',
            dot : 'https://cdn.discordapp.com/attachments/524159437464797184/526471615387795466/dot.png',
            blast : 'https://cdn.discordapp.com/attachments/524159437464797184/526493484543246348/blast.png',
        },

        chess : {
            field : 'https://cdn.discordapp.com/attachments/524159437464797184/527395245386629121/chessField.png',
            blackSquare : 'https://cdn.discordapp.com/attachments/524159437464797184/527417268842397716/blackSquare.png',
            whiteSquare : 'https://cdn.discordapp.com/attachments/524159437464797184/527417312878395410/whiteSquare.png',
            blackPawn : 'https://cdn.discordapp.com/attachments/524159437464797184/527131436382158879/blackPawn.png',
            blackHourse : 'https://cdn.discordapp.com/attachments/524159437464797184/527131380858224641/blackHourse.png',
            blackEleph : 'https://cdn.discordapp.com/attachments/524159437464797184/527131309282295809/blackEleph.png',
            blackLadya : 'https://cdn.discordapp.com/attachments/524159437464797184/527131421605756941/blackLadya.png',
            blackFerz : 'https://cdn.discordapp.com/attachments/524159437464797184/527131366618300416/blackFerz.png',
            blackKing : 'https://cdn.discordapp.com/attachments/524159437464797184/527131405055033354/blackKing.png',
            whitePawn : 'https://cdn.discordapp.com/attachments/524159437464797184/527131598462779393/whitePawn.png',
            whiteHourse : 'https://cdn.discordapp.com/attachments/524159437464797184/527131534898233344/whiteHourse.png',
            whiteEleph : 'https://cdn.discordapp.com/attachments/524159437464797184/527131491059236864/whiteEleph.png',
            whiteLadya : 'https://cdn.discordapp.com/attachments/524159437464797184/527131578598424607/whiteLadya.png',
            whiteFerz : 'https://cdn.discordapp.com/attachments/524159437464797184/527131508947943434/whiteFerz.png',
            whiteKing : 'https://cdn.discordapp.com/attachments/524159437464797184/527131558205849601/whiteKing.png'
        }
    },
    minigames : {
        countries : ['Зимбабве', 'Хорватия', 'Латвия', 'Казахстан', 'Россия', 'Греция',
            'Дания', 'Уганда', 'Финляндия', 'Беларусь', 'Румыния', 'Албания', 'Швейцария', 
            'Монако', 'Польша', 'Италия', 'Америка', 'Великобритания', 'Португалия', 'Турция',
            'Египет', 'Индия', 'Австралия', 'Новая Зеландия', 'Сингапур', 'Малайзия', 'Пакистан',
            'Узбекистан', 'Китай', 'Украина', 'Германия', 'Франция', 'Япония', 'Бразилия',
            'Бангладеш', 'Австрия', 'Венгрия', 'Непал', 'Индонезия', 'Уругвай', 'Парагвай',
            'Аргентина', 'Чили', 'Куба', 'Перу', 'Сирия', 'Ирак', 'Иран',
            'Чехия'
        ],

        flags : [':flag_zw:', ':flag_hr:', ':flag_lv:', ':flag_kz:', ':flag_ru:', ':flag_gr:',
            ':flag_dk:', ':flag_ug:', ':flag_fi:', ':flag_by:', ':flag_ro:', ':flag_al:', ':flag_ch:', 
            ':flag_mc:', ':flag_pl:', ':flag_it:', ':flag_us:', ':flag_gb:', ':flag_pt:', ':flag_tr:',
            ':flag_eg:', ':flag_in:', ':flag_au:', ':flag_nz:', ':flag_sg:', ':flag_my:', ':flag_pk:',
            ':flag_uz:', ':flag_cn:', ':flag_ua:', ':flag_de:', ':flag_fr:', ':flag_jp:', ':flag_br:',
            ':flag_bd:', ':flag_at:', ':flag_hu:', ':flag_np:', ':flag_my:', ':flag_uy:', ':flag_py:',
            ':flag_ar:', ':flag_cl:', ':flag_cu:', ':flag_pf:', ':flag_sy:', ':flag_iq:', ':flag_ir:',
            ':flag_cz:'
        ],

        capitals : ['Хараре', 'Загреб', 'Рига' , 'Астана', 'Москва', 'Афины',
            'Копенгаген', 'Кампала', 'Хельсинки', 'Минск', 'Бухарест', 'Тирана', 'Берн',
            'Монако', 'Варшава', 'Рим', 'Вашингтон', 'Лондон', 'Лиссабон', 'Анкара',
            'Каир', 'Нью-Дели', 'Канберра', 'Веллингтон', 'Сингапур', 'Куала-Лумпур', 'Исламабад',
            'Ташкент', 'Пекин', 'Киев', 'Берлин', 'Париж', 'Токио', 'Бразилиа',
            'Дакка', 'Вена', 'Будапешт', 'Катманду', 'Джакарта', 'Монтевидео', 'Асунсьон',
            'Буэнос-Айрес', 'Сантьяго', 'Гавана', 'Лима', 'Дамаск', 'Багдад', 'Тегеран',
            'Прага'
        ]
    }
}