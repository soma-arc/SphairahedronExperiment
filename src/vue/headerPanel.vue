<template>
  <header>
    <ul class="headerLeft">
      <li class="headerContent"><span>Sphairahedron-based Fractal Renderer</span></li>
    </ul>
  </header>
</template>

<script>
export default{
    props: [],
    methods: {
    }
}
</script>

<style>
header {
    font-family: "Times New Roman";
    border-style: ridge;
    border-color: gray;

    overflow:hidden;
    font-size: 2rem;
    height: 50px;
    flex-basis: 50px;
    background-color: Azure;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    cursor: default;
}

.headerLeft {
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;

    list-style: none;
    height: 50px;
}

.headerRight{
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;

    list-style: none;
    height: 50px;;

    flex-direction: row-reverse;
}

.buttonLi {
    flex: 1;
    align-items: center;
    justify-content: center;
    padding-right: 10px;
    display: flex;
}

.headerContent {
    padding: 5px;
}
</style>
