<template>
    <div class="hello">
        <h3>API Calls</h3>
        <form @submit.prevent="sendDemoRequest">
            <input type="text" v-model="demoRequest.name" required>
            <br>
            <input type="number" v-model.number="demoRequest.randomNumber" required>
            <br>
            <input type="checkbox" v-model="demoRequest.optionalBoolean"> Optional Boolean
            <br>
            <button type="submit">Send Request</button>
        </form>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Configuration, DefaultApi, DemoRequest} from '@/generated';

    const apiConfiguration = new Configuration({
        basePath: location.origin
    });
    const api = new DefaultApi(apiConfiguration);

    export default Vue.extend({
        name: 'HelloWorld',
        data() {
            return {
                demoRequest: {
                    name: '',
                    randomNumber: 0,
                    optionalBoolean: false
                } as DemoRequest
            }
        },
        methods: {
            async sendDemoRequest() {
                const response = await api.demo({
                    id: 12,
                    page: 23,
                    demoRequest:this.demoRequest
                });
                alert(JSON.stringify(response));
            }
        }
    });
</script>

<style scoped>
    h3 {
        margin: 40px 0 0;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        display: inline-block;
        margin: 0 10px;
    }

    a {
        color: #42b983;
    }
</style>
