<template>
  <footer>
    <div id="left">
      <a id="ghLink" href="https://github.com/soma-arc/SphairahedronExperiment"
         target="_blank">
        <img src="../img/GitHub-Mark-32px.png" class="imgLink"/>
      </a>
    </div>
    <div>
      Created by soma_arc
    </div>
  </footer>
</template>
  
<script>
</script>

<style>
  footer {
    border-style: ridge;
    border-color: gray;
    height: 50px;
    background-color: Azure;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 0.9rem;
    
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    cursor: default;
}

#left {
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-left: 10px;
}

.imgLink{
    padding-top: 10px;
    padding-left: 5px;
}

#ghLink {
    height: 50px;
}
</style>
