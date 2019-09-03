function remove(s){
let res= ""
for (var i = 0; i < s.length; i++) {
res += s[i].replace("!", "")
console.log(res, i)
}
return res + "!" 
}

console.log(remove("!HI, !HI"))