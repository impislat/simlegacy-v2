export const demoPeople=[
{id:'s1',name:'Эвелин Харт',life:'Взрослая',gen:1,role:'Основательница',bio:'Всё началось с маленького дома в Виллоу Крик и мечты открыть свою галерею.',x:140,y:80,photo:'',parents:[],partner:'s2'},
{id:'s2',name:'Теодор Харт',life:'Взрослый',gen:1,role:'',bio:'Музыкант, который нашёл вдохновение в семейной жизни.',x:390,y:80,photo:'',parents:[],partner:'s1'},
{id:'s3',name:'Лили Харт',life:'Молодая',gen:2,role:'Наследница',bio:'Пишет свою историю в Сан-Мишуно.',x:140,y:365,photo:'',parents:['s1','s2'],partner:'s4'},
{id:'s4',name:'Ноа Брукс',life:'Молодой',gen:2,role:'',bio:'Архитектор и любитель домашних животных.',x:390,y:365,photo:'',parents:[],partner:'s3'},
{id:'s5',name:'Мия Харт',life:'Ребёнок',gen:3,role:'',bio:'Новая глава семейной истории.',x:270,y:650,photo:'',parents:['s3','s4'],partner:''}
];
export const uid=()=>crypto.randomUUID();
export const demoTree=()=>({id:'demo',owner_id:null,title:'Семья Харт',description:'Три поколения любви, открытий и новых возможностей',cover:'',public:false,created_at:new Date().toISOString(),people:demoPeople});
