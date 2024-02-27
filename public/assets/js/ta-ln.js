// Append Line Numbers
function LNPrefix(ta) {
// Needs to be adaptive - EFFICENCY
//  - Check exists
//  - Check length
//    - If newNum < current (childElementCount): removeChildren
//    - If newNum >= current (childElementCount): addChildren
//  -

  var p = ta.parentElement,
      lineCount = ta.value.split(/\r?\n/).length + 10;

  ta.style.cssText = "width:90%;resize:none;line-height: normal !important;";

  p.classList.add("LN_area");
  p.style.cssText = "overflow:hidden;height:250px;";

  function appendLineNum(sb, line) {
    var n = document.createElement("div");
    n.innerText = line;
    n.classList.add("LN_n");
    n.style.cssText = "text-align:right;padding-right:.1rem;";
    sb.appendChild(n);
  }

  var toDelete = document.getElementsByClassName("LN_sb")[0];
  if (toDelete)
    p.removeChild(toDelete);

    // var currentLineCount = ;
    // if (lineCount > currentLineCount);

  var sidebar = document.createElement("div");
  sidebar.classList.add("LN_sb");
  sidebar.style.cssText = "padding-top:.375rem;display:inline-block;float:left;width:auto;";
  p.insertBefore(sidebar, ta);

  for (var l = 0; l < lineCount; l++)
  appendLineNum(document.getElementsByClassName("LN_sb")[0], l+1);


  input.addEventListener("scroll", function (e) {
    var style = this.parentElement.children[0].style,
        o = style.margin - this.scrollTop;
    style.marginTop = String(o)+"px";
    this.parentElement.style.overflow = "hidden";
  });
}
