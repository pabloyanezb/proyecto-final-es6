// Crea la opción para obtener las coordenadas del usuario
navigator.geolocation.getCurrentPosition(position => {   
    const latitud = position.coords.latitude;
    const longitud = position.coords.longitude;
    
    $('.ciudad-origen').prepend(`<option value='${latitud},${longitud}'selected="selected"> <b>Ubicación actual</b> </option>`);
    $(".ciudad-origen").select2({ // Inicializa el select2
        matcher: modelMatcher
    });
});

// Crea un nuevo objeto en donde las comunas están agrupadas por región, basado en lugares.js
const lugares_por_region = _.groupBy(lugares, lugar => lugar['Región']);
console.log(lugares_por_region)

// Crea las opciones de ubicación (comunas de Chile)           
for (const region in lugares_por_region){
    let value = lugares_por_region[region];
    $('.ciudad-origen, .ciudad-destino').append(`<optgroup label="${region}"></optgroup>`);
    for (const comuna of value){
        let latitud = comuna['Latitud (Decimal)'];
        let longitud = comuna['Longitud (decimal)'];
        $(`optgroup[label="${region}"]`).append(`<option value='${latitud},${longitud}'>${comuna.Comuna}</option>`);  
    }
}

// Creación de Clase y sus instancias
const vehiculos = [];
class Vehiculo {
    constructor(){
        vehiculos.push(this); // LLeva los objetos creados a un al array vehículos
    }
    get_consumo(km = 0) { // Calcula el consumo de combustible
        let consumo = km / this.rendimiento;
        consumo = Math.round(consumo * 10)/ 10; // Redondea el resultado
        return consumo;
    }
}
class Auto extends Vehiculo {
    constructor(modelo, rendimiento = 12, propulsion) {
        super();
        this.modelo = modelo;
        this.rendimiento = rendimiento;
        this.propulsion = propulsion;
    }
}
class Camioneta extends Vehiculo {
    constructor(modelo, rendimiento = 10, propulsion) {
        super();
        this.modelo = modelo;
        this.rendimiento = rendimiento;
        this.propulsion = propulsion;
    }  
}
class Moto extends Vehiculo {
    constructor(modelo, rendimiento = 17.5, propulsion = 'gasolina') {
        super();
        this.modelo = modelo;
        this.rendimiento = rendimiento;
        this.propulsion = propulsion;
    }
}
class Camion extends Vehiculo {
    constructor(modelo, rendimiento = 5, propulsion = 'diesel') {
        super();
        this.modelo = modelo;
        this.rendimiento = rendimiento;
        this.propulsion = propulsion;
    }

}
const kia = new Auto('Kia Soul', 12.1, 'gasolina'); 
const mitsubishi = new Camioneta('Mitsubishi L200', 10, 'diesel');
const yamaha = new Moto('Yamaha FZ16', 26.5);
const volvo = new Camion('Volvo FH');

// Crea las opciones de vehículos
for (const vehiculo of vehiculos){
    $('.vehiculo').append(`<option value='${vehiculo.rendimiento}' id='${vehiculo.modelo}'>${vehiculo.modelo}</option>`);
}

// Función que calcula el consumo de combustible
$('.calcular').on('click', function(){
        
    if ($('.ciudad-origen').val() == '' || $('.ciudad-destino').val() == '' || $('.vehiculo').val() == ''){
        return;
    } else {
        $(this).attr('data-toggle', 'collapse');
        event.preventDefault();
    }
        
    let coord_origen = $('.ciudad-origen').val();
    let coord_destino = $('.ciudad-destino').val();
    
    const modelo_vehiculo = $('.vehiculo option:selected').text()
    const vehiculo = vehiculos.find(vehicle => vehicle.modelo === modelo_vehiculo);

    $(this).toggleClass('btn-calcular back');
    if ( $(this).hasClass('back')){
        $(this).attr('value', '');
        $(this).css("background-image", "url(./img/flecha.png)");
        
    } else {
        $(this).attr('value', 'Calcular');
        $(this).css("background-image", "");
    }
    
    // LLamamos a la API de Google Maps
    fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${coord_origen}&destinations=${coord_destino}&key=AIzaSyAlDSRLGoUqLzoFZQlR7wvyRoNdsufoQls`, {})
    .then(datos => datos.json())
    .then(datos_json => {
        const array_destino = datos_json.destination_addresses[0].split(',');
        const array_origen = datos_json.origin_addresses[0].split(',');
        // Creamos una dirección que solo contenga comuna, región y país (Sin calles)
        const destino = [...array_destino].slice(-3); 
        const origen = [...array_origen].slice(-3);
        // Al ser hasta ahora solo direcciones de Chile, evitamos ese texto
        destino.pop();
        origen.pop();
        const distancia = datos_json.rows[0].elements[0].distance.text;
        const km = (datos_json.rows[0].elements[0].distance.value)/1000;
        const tiempo =  datos_json.rows[0].elements[0].duration.text;
        // Creamos nuestro mensaje con los resultados
        $('.card-body').html(
            `<p class="card-text">Viaje desde <b>${origen}</b> hasta <b>${destino} </b></p>
                <table class="table table-borderless text-light">
                    <thead>
                        <tr>
                            <th scope="col">Distancia</th>
                            <th scope="col">Tiempo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${distancia}</td>
                            <td>${tiempo}</td>
                        </tr>
                        <tr>
                            <th colspan='2'>Vehículo</th>
                        </tr>
                        <tr>
                            <td colspan='2'>${$('.vehiculo option:selected').text()}</td>
                        </tr>
                        <tr>
                            <th colspan='2'>Consumo</th>
                        </tr>
                        <tr>
                            <td colspan='2'>${vehiculo.get_consumo(km)} litros </td>
                        </tr>
                    </tbody>
                </table>`);
    })
    .catch( error => console.log(error)); 
})

// Ordena las comunas por orden alfabético
$('select optgroup').each((index,elmt) => {
    result = $(elmt).find("option").toArray().sort((option1, option2) => option1.innerHTML.localeCompare(option2.innerHTML));
    $(result).appendTo(elmt);    
});