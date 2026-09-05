const CONTACT_EMAIL="Gholamzadem69@gmail.com";
const LICENSE_HASH="f328d8e7874a6a6e38df37ca9067ef6b93a36fbc13d483f5c59e65caf2558c12";

async function sha256(value){const data=new TextEncoder().encode(value);const hash=await crypto.subtle.digest("SHA-256",data);return Array.from(new Uint8Array(hash)).map(x=>x.toString(16).padStart(2,"0")).join("")}
function plusActive(){return localStorage.getItem("rg-plus")==="active"}
async function activatePlus(){const code=prompt("کد فعال‌سازی روزنگار پلاس را وارد کنید");if(!code)return;if(await sha256(code.trim().toUpperCase())===LICENSE_HASH){localStorage.setItem("rg-plus","active");alert("نسخه روزنگار پلاس فعال شد");render()}else alert("کد فعال‌سازی صحیح نیست")}
function emailLink(subject,body=""){return "mailto:"+CONTACT_EMAIL+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body)}

function enhanceSchedule(){
 const add=document.querySelector("#add-time"),schedule=document.querySelector("#schedule");
 if(add&&!document.querySelector("#schedule-form"))add.onclick=()=>{const form=document.createElement("div");form.id="schedule-form";form.className="schedule-form";form.innerHTML='<label>ساعت<input id="schedule-time" type="time"></label><label>عنوان برنامه<input id="schedule-title" placeholder="مثلاً مطالعه زبان"></label><button id="save-schedule">ثبت برنامه</button><button id="cancel-schedule" class="cancel">انصراف</button>';add.before(form);document.querySelector("#save-schedule").onclick=()=>{const time=document.querySelector("#schedule-time").value,title=document.querySelector("#schedule-title").value.trim();if(!time||!title)return alert("ساعت و عنوان برنامه را وارد کنید");state.times.push(JSON.stringify({time,title}));render()};document.querySelector("#cancel-schedule").onclick=()=>form.remove()};
 schedule?.querySelectorAll(".time").forEach(row=>{const time=row.querySelector("time"),title=row.querySelector("b");if(time?.textContent==="جدید"&&title?.textContent?.startsWith("{"))try{const item=JSON.parse(title.textContent);time.textContent=item.time;title.textContent=item.title}catch{}})
}

function enhanceAdvertisement(){const ad=document.querySelector(".ad");if(!ad||ad.querySelector(".ad-request"))return;const link=document.createElement("a");link.className="ad-request";link.textContent="درخواست ثبت تبلیغ";link.href=emailLink("درخواست تبلیغات در روزنگار","سلام، برای ثبت تبلیغ در روزنگار درخواست دارم.");ad.querySelector("div")?.appendChild(link)}

function injectAdvanced(){
 enhanceSchedule();enhanceAdvertisement();
 const grid=document.querySelector(".grid");if(!grid||document.querySelector(".advanced-tools"))return;
 const active=plusActive(),section=document.createElement("section");section.className="advanced-tools";
 section.innerHTML='<div class="box '+(active?'unlocked':'locked')+'"><small>امکانات پلاس</small><h2>🔔 یادآور '+(active?'فعال':'قفل است')+'</h2>'+(active?'<input id="adv-title" placeholder="عنوان یادآور"><input id="adv-time" type="datetime-local"><button id="adv-remind">تنظیم یادآور</button><p><small>برای دریافت اعلان، صفحه را باز نگه دارید.</small></p>':'<p>یادآورها و امکانات پیشرفته برای خریداران نسخه پلاس فعال می‌شود.</p><button id="activate-plus">واردکردن کد فعال‌سازی</button>')+'</div><div class="box plus"><small>روزنگار پلاس</small><h2>نسخه پیشرفته‌تر</h2><p>یادآور، حذف تبلیغات و امکانات پیشرفته آینده.</p>'+(active?'<b class="active-badge">✓ نسخه پلاس فعال است</b>':'<a href="'+emailLink('درخواست خرید روزنگار پلاس','سلام، برای خرید نسخه پلاس و دریافت کد فعال‌سازی درخواست دارم.')+'">درخواست خرید و دریافت کد</a>')+'</div><div class="box"><h2>ارتباط با ما</h2><p>برای پشتیبانی، پیشنهادها و گزارش مشکل پیام بفرستید.</p><a href="'+emailLink('پیام از روزنگار')+'">ارسال ایمیل</a><small class="email">'+CONTACT_EMAIL+'</small></div><div class="box wide"><h2>♡ حمایت مالی</h2><p>اطلاعات پرداخت عمومی هنوز ثبت نشده است. برای هماهنگی حمایت پیام بفرستید.</p><a href="'+emailLink('حمایت از روزنگار','سلام، می‌خواهم از توسعه روزنگار حمایت کنم. لطفاً روش پرداخت را اعلام کنید.')+'">هماهنگی برای حمایت</a></div>';
 grid.appendChild(section);
 document.querySelector("#activate-plus")?.addEventListener("click",activatePlus);
 document.querySelector("#adv-remind")?.addEventListener("click",async()=>{const title=document.querySelector("#adv-title").value,time=document.querySelector("#adv-time").value;if(!title||!time)return alert("عنوان و زمان را وارد کنید");if("Notification" in window&&Notification.permission==="default")await Notification.requestPermission();const delay=new Date(time).getTime()-Date.now();if(delay<=0)return alert("زمانی در آینده انتخاب کنید");setTimeout(()=>Notification.permission==="granted"?new Notification("روزنگار",{body:title}):alert("یادآور: "+title),delay);alert("یادآور تنظیم شد؛ صفحه را باز نگه دارید.")});
}
new MutationObserver(injectAdvanced).observe(document.querySelector("#app"),{childList:true,subtree:true});injectAdvanced();
