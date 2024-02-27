$(document).ready(function() {
    // Máscara para o endereço MAC
    $('#enderecoMAC').mask('AA:AA:AA:AA:AA:AA', {
        translation: {
            'A': { pattern: /[0-9A-Fa-f]/ }
        },
        onKeyPress: function(value, e, field, options) {
            // Coloca o valor padrão se estiver vazio
            if(value.length === 0) {
                $(field).val('00:00:00:00:00:00');
            }
        }
    });

    // Máscara para o endereço IP
    $('#enderecoIP').mask('099.099.099.099/99', {
        translation: {
            '0': { pattern: /[0-9]/ }
        },
        onKeyPress: function(value, e, field, options) {
            // Coloca o valor padrão se estiver vazio
            if(value.length === 0) {
                $(field).val('192.168.1.1/24');
            }
        }
    });

    // Validar o formulário
    $('#meuFormulario').submit(function(e) {
        e.preventDefault();
        var enderecoMAC = $('#enderecoMAC').val();
        var enderecoIP = $('#enderecoIP').val();

        // Validação do endereço MAC
        if(!/([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}/.test(enderecoMAC)) {
            alert("Endereço MAC inválido!");
            return false;
        }

        // Validação do endereço IP
        if(!/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(enderecoIP)) {
            alert("Endereço IP inválido!");
            return false;
        }

        // Aqui, o formulário é válido
        alert("Formulário enviado com sucesso!");
        // Aqui você pode adicionar o código para enviar o formulário
    });
});