let currentStep=1, selectedTopic=-1, dragIndex=null, saveTimer=null;
let outcomes=[{code:"РО 10.1",name:"Разрабатывать серверные приложения с использованием Node.js",hours:72}];
let topics=[];

const $=id=>document.getElementById(id);
const esc=value=>String(value??"")
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");

function toast(msg){
    const t=$("toast");
    t.textContent=msg;t.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer=setTimeout(()=>t.classList.remove("show"),2400)
}

function scheduleSave(){
    clearTimeout(saveTimer);
    $("saveState").textContent="Сохранение…";
    saveTimer=setTimeout(()=>save(false),500)
}

document.addEventListener("input",e=>{if(e.target.closest("main"))scheduleSave()});
document.addEventListener("change",e=>{if(e.target.closest("main"))scheduleSave()});

function next(step){
 if(step===5 && !validateHours()){toast("Сначала распределите часы без отклонения.");return}
 showStep(step);
}

function showStep(step){
 document.querySelectorAll(".wizard-step").forEach(x=>x.classList.add("hidden"));
 $("step"+step).classList.remove("hidden");currentStep=step;
 document.querySelectorAll(".step").forEach(x=>{const n=+x.dataset.step;x.classList.toggle("active",n===step);x.classList.toggle("done",n<step)});
 document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.nav==step||(+x.dataset.nav===1&&step===2)));
 if(step===6)validate();if(step===7)renderPreview();window.scrollTo({top:0,behavior:"smooth"});
}

document.querySelectorAll(".step").forEach(x=>x.addEventListener("click",()=>{const n=+x.dataset.step;if(n<=currentStep||n===currentStep+1)showStep(n)}));
document.querySelectorAll(".nav").forEach(x=>x.addEventListener("click",()=>showStep(+x.dataset.nav)));

function renderOutcomes(){
 $("outcomes").innerHTML=outcomes.length?outcomes.map((o,i)=>`<div class="card" style="background:#f8fafc;padding:17px">
 <div class="grid">
 <div>
 <label>Код РО</label>
 <input value="${esc(o.code)}" onchange="outcomes[${i}].code=this.value">
 </div>

 <div>
 <label>Количество часов</label>
 <input type="number" min="0" value="${o.hours}" onchange="outcomes[${i}].hours=Number(this.value)||0">
 </div>
 </div>

 <label style="margin-top:12px">Название результата</label>
 <textarea onchange="outcomes[${i}].name=this.value">${esc(o.name)}</textarea>
 <button class="btn btn-danger" style="margin-top:10px" onclick="outcomes.splice(${i},1);renderOutcomes();scheduleSave()">Удалить</button>
 </div>`).join(""):`<div class="empty">Результатов пока нет. Добавьте хотя бы один результат обучения.</div>`;
}

function addOutcome(){
    outcomes.push({code:"РО "+(outcomes.length+1),name:"Новый результат обучения",hours:0});renderOutcomes();scheduleSave()
}

function getHours(){
    return ["theory","practice","labs","selfWork"].reduce((s,id)=>s+(Number($(id).value)||0),0)
}

function recalculate(){
 const total=Number($("totalHours").value)||0, allocated=getHours(), diff=total-allocated;
 $("allocated").textContent=allocated;
 $("required").textContent=total;
 $("remaining").textContent=Math.abs(diff);
 const st=$("hourStatus");
 st.className=diff===0?"ok":diff>0?"warning":"error";
 st.textContent=diff===0?"✓":diff>0?"!":"✕";
 $("progress").style.width=Math.min(100,Math.max(0,total?allocated/total*100:0))+"%";
 recalculateTopics();
}

function validateHours(){
    return getHours()===Number($("totalHours").value)
}

function recalculateTopics(){
 const h=Number($("totalHours").value)||0,d=Number($("topicDuration").value)||1;$("topicCount").value=Math.ceil(h/d);if(topics.length)renderTopics()
}

const baseTopics=[
    "Введение в Node.js",
    "Архитектура Node.js",
    "Установка Node.js и npm",
    "Работа с модулями",
    "Файловая система",
    "Событийная модель",
    "Асинхронное программирование",
    "Callback и Promise",
    "Async/Await",
    "Обработка ошибок",
    "HTTP-модуль",
    "Создание HTTP-сервера",
    "Маршрутизация",
    "REST API",
    "Express.js",
    "Middleware",
    "Запросы и ответы",
    "Работа с JSON",
    "Подключение базы данных",
    "CRUD-операции",
    "Аутентификация",
    "Авторизация",
    "JWT",
    "Валидация данных",
    "Безопасность",
    "Логирование",
    "Тестирование API",
    "Отладка приложения",
    "Переменные окружения",
    "Архитектура приложения",
    "Итоговый проект"
];

function topicTemplate(title,h){
    return {title,hours:h,type:"Практическое занятие",control:"Практическая работа",content:"",goal:"",practice:"",result:""}
}

function addTopic(title="Новая тема",hours=null){
    const d=Number($("topicDuration").value)||2;
    topics.push(topicTemplate(title,hours||d));
    renderTopics();scheduleSave()
}

function renderTopics(){
 const box=$("topics");
 box.innerHTML=topics.length?topics.map((t,i)=>`<div class="topic" draggable="true" data-index="${i}" ondragstart="dragStart(event)" ondragend="dragEnd(event)" ondragover="event.preventDefault()" ondrop="dropTopic(event)">
 <div class="drag" title="Перетащить">⋮⋮</div><div><input value="${esc(t.title)}" onchange="topics[${i}].title=this.value;scheduleSave()"><div class="topic-meta"><span class="badge badge-blue">${esc(t.type)}</span><button class="btn btn-secondary" style="padding:4px 8px;font-size:11px" onclick="openLesson(${i})">✎ Содержание</button></div></div>
 <input type="number" min="1" value="${t.hours}" onchange="topics[${i}].hours=Math.max(1,Number(this.value)||1);renderTopics();scheduleSave()">
 <select onchange="topics[${i}].control=this.value;scheduleSave()">${["Практическая работа","Опрос","Тестирование","Лабораторная работа","Проект","Экзамен"].map(x=>`<option ${x===t.control?"selected":""}>${x}</option>`).join("")}</select>
 <button class="btn btn-danger" style="padding:7px" onclick="topics.splice(${i},1);renderTopics();scheduleSave()" title="Удалить">×</button></div>`).join(""):`<div class="empty">Тем пока нет. Нажмите «Автосформировать темы» или «＋ Тема».</div>`;
 const total=topics.reduce((s,t)=>s+Number(t.hours||0),0),required=Number($("totalHours").value)||0;
 $("topicTotal").innerHTML=`<div class="notice ${total===required?"success":"warning"}">Тематический план: <b>${total}</b> / ${required} часов ${total===required?"— ✓ распределение корректно":`— отклонение ${Math.abs(required-total)} ч.`}</div>`;
}

function dragStart(e){dragIndex=+e.currentTarget.dataset.index;e.currentTarget.classList.add("dragging")}
function dragEnd(e){e.currentTarget.classList.remove("dragging")}

function dropTopic(e){
    const target=+e.currentTarget.dataset.index;
    if(dragIndex===null||dragIndex===target)return;
    const item=topics.splice(dragIndex,1)[0];
    topics.splice(target,0,item);dragIndex=null;
    renderTopics();
    scheduleSave();
}

function generateAI(){
 const count=Number($("topicCount").value)||1,d=Number($("topicDuration").value)||2;
 topics=[];for(let i=0;i<count;i++)topics.push(topicTemplate(baseTopics[i]||`Практическая разработка по результату обучения №${i+1}`,d));
 const diff=(Number($("totalHours").value)||0)-topics.reduce((s,t)=>s+t.hours,0);if(diff>0&&topics.length)topics[topics.length-1].hours+=diff;
 if(diff<0&&topics.length)topics[topics.length-1].hours=Math.max(1,topics[topics.length-1].hours+diff);
 renderTopics();scheduleSave();toast("Тематический план сформирован");
}

function generateGoal(){
 const discipline=$("programName").value.trim()||"программы", outcome=outcomes[0]?.name||"освоения профессиональных компетенций";
 $("goal").value=`Формирование у обучающихся профессиональных компетенций, необходимых для освоения ${discipline}, и достижения результата обучения: ${outcome}.`;
 scheduleSave();toast("Цель сформирована");
}

function openLesson(i){
    selectedTopic=i;
    const t=topics[i];
    $("lessonGoal").value=t.goal||"";
    $("lessonContent").value=t.content||"";
    $("lessonPractice").value=t.practice||"";
    $("lessonResult").value=t.result||"";
    $("modal").classList.remove("hidden");
}

function closeModal(){$("modal").classList.add("hidden")}
function generateLesson(){const t=topics[selectedTopic];
    if(!t)return;
    $("lessonGoal").value=`Сформировать практические навыки по теме «${t.title}».`;
    $("lessonContent").value=`Основные понятия и принципы темы «${t.title}», разбор примеров и типичных ошибок.`;
    $("lessonPractice").value=`Выполнить практическое задание по теме «${t.title}» и продемонстрировать результат.`;
    $("lessonResult").value=`Обучающийся понимает основные принципы темы «${t.title}» и применяет их при выполнении практического задания.`;
}

function saveLesson(){
    if(selectedTopic<0)return;
    const t=topics[selectedTopic];
    t.goal=$("lessonGoal").value;
    t.content=$("lessonContent").value;
    t.practice=$("lessonPractice").value;
    t.result=$("lessonResult").value;closeModal();
    renderTopics();
    scheduleSave();
    toast("Содержание занятия сохранено");
}

function validate(){
 const errors=[],
 warnings=[],
 total=Number($("totalHours").value)||0,
 allocated=getHours(),
 topicTotal=topics.reduce((s,t)=>s+Number(t.hours||0),0);
 
 if(!$("programName").value.trim())errors.push("Не указано название дисциплины/ПМ.");
 if(!outcomes.length)errors.push("Не добавлен ни один результат обучения.");
 if(allocated!==total)errors.push(`Часы распределены неверно: ${allocated} из ${total}.`);
 if(!topics.length)errors.push("Не создан тематический план.");
 if(topicTotal!==total)errors.push(`Тематический план содержит ${topicTotal} из ${total} часов.`);
 topics.forEach((t,i)=>{if(!t.title.trim())errors.push(`Тема №${i+1} не имеет названия.`)});
 if(topics.some(t=>!t.content))warnings.push("Не для всех тем заполнено содержание занятия.");
 if(!$("goal").value.trim())warnings.push("Не сформулирована цель программы.");
 let html=errors.length?`<div class="notice danger"><b>Нужно исправить:</b><ul>${errors.map(e=>`<li>${esc(e)}</li>`).join("")}</ul></div>`:`<div class="notice success"><b>✓ Критических ошибок нет.</b><br>Рабочая программа готова к согласованию.</div>`;
 if(warnings.length)html+=`<div class="notice warning"><b>Рекомендации:</b><ul>${warnings.map(e=>`<li>${esc(e)}</li>`).join("")}</ul></div>`;
 html+=`<div class="stats"><div class="stat"><div class="stat-number">${total}</div><div class="stat-label">Всего часов</div></div><div class="stat"><div class="stat-number">${topics.length}</div><div class="stat-label">Тем</div></div><div class="stat"><div class="stat-number">${outcomes.length}</div><div class="stat-label">Результатов обучения</div></div><div class="stat"><div class="stat-number ${errors.length?"error":"ok"}">${errors.length?"Ошибка":"100%"}</div><div class="stat-label">Готовность</div></div></div>`;
 $("validation").innerHTML=html;return !errors.length
}
function goPreview(){if(!validate()){toast("Есть ошибки — исправьте их перед просмотром.");return}showStep(7)}
function renderPreview(){
 const fields=id=>$(id).value, total=fields("totalHours");
 $("preview").innerHTML=`<h1>РАБОЧАЯ УЧЕБНАЯ ПРОГРАММА</h1><p><b>Учебный год:</b> ${esc(fields("year"))}</p><p><b>Специальность:</b> ${esc(fields("specialty"))}</p><p><b>Квалификация:</b> ${esc(fields("qualification"))}</p><p><b>Группа:</b> ${esc(fields("group"))}</p><p><b>Преподаватель:</b> ${esc(fields("teacher"))}</p>
 <h2>1. Общая информация</h2><table><tr><td><b>Код</b></td><td>${esc(fields("code"))}</td></tr><tr><td><b>Название</b></td><td>${esc(fields("programName"))}</td></tr><tr><td><b>Количество часов</b></td><td>${esc(total)}</td></tr><tr><td><b>Форма контроля</b></td><td>${esc(fields("control"))}</td></tr></table>
 <h2>2. Цель программы</h2><p>${esc(fields("goal")||"Не сформирована")}</p><h2>3. Результаты обучения</h2><table><tr><th>Код</th><th>Результат обучения</th><th>Часы</th></tr>${outcomes.map(o=>`<tr><td>${esc(o.code)}</td><td>${esc(o.name)}</td><td>${o.hours}</td></tr>`).join("")}</table>
 <h2>4. Тематический план</h2><table><tr><th>№</th><th>Тема</th><th>Часы</th><th>Форма контроля</th></tr>${topics.map((t,i)=>`<tr><td>${i+1}</td><td>${esc(t.title)}</td><td>${t.hours}</td><td>${esc(t.control)}</td></tr>`).join("")}</table>
 <h2>5. Содержание занятий</h2>${topics.map((t,i)=>`<h3>${i+1}. ${esc(t.title)}</h3><p><b>Цель:</b> ${esc(t.goal||"—")}</p><p><b>Содержание:</b> ${esc(t.content||"—")}</p><p><b>Практическое задание:</b> ${esc(t.practice||"—")}</p><p><b>Ожидаемый результат:</b> ${esc(t.result||"—")}</p>`).join("")}`;
}
function documentHtml(){return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;font-size:12pt;line-height:1.45}h1,h2{text-align:center}table{width:100%;border-collapse:collapse;margin:12px 0}td,th{border:1px solid #000;padding:6px;vertical-align:top}@page{size:A4;margin:20mm}</style></head><body>${$("preview").innerHTML}</body></html>`}
function downloadWord(){renderPreview();const blob=new Blob(["\ufeff",documentHtml()],{type:"application/msword"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="Рабочая_учебная_программа.doc";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);toast("Документ Word подготовлен")}
function printDocument(){renderPreview();const w=window.open("","_blank");if(!w){toast("Браузер заблокировал окно печати.");return}w.document.write(documentHtml());w.document.close();w.focus();setTimeout(()=>w.print(),400)}
function collect(){const data={};["specialty","qualification","course","group","year","semester","language","teacher","programType","code","programName","totalHours","credits","control","theory","practice","labs","selfWork","goal","topicDuration"].forEach(id=>data[id]=$(id).value);data.outcomes=outcomes;data.topics=topics;return data}
function save(manual=false){localStorage.setItem("rp_studio_data",JSON.stringify(collect()));$("saveState").textContent="Сохранено в браузере";if(manual){toast("Черновик сохранён");}}
function load(){const raw=localStorage.getItem("rp_studio_data");if(!raw)return;try{const d=JSON.parse(raw);Object.keys(d).forEach(k=>{const el=$(k);if(el&&typeof d[k]!=="object")el.value=d[k]});if(Array.isArray(d.outcomes))outcomes=d.outcomes;if(Array.isArray(d.topics))topics=d.topics}catch(e){localStorage.removeItem("rp_studio_data")}}
function submitProgram(){if(!validate()){toast("Исправьте ошибки перед отправкой.");showStep(6);return}save(false);toast("РП отправлена на согласование (демо-режим)")}
function scrollToTop(){window.scrollTo({top:0,behavior:"smooth"})}
$("modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});
window.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
load();renderOutcomes();recalculate();if(!topics.length)generateAI();else renderTopics();