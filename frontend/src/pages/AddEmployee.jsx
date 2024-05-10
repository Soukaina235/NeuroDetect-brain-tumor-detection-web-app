import FormEmployee from "../components/FormEmployee";

function AddEmployee({ authorized }) {
    return (

        <FormEmployee route="/api/add_employee/" authorized={authorized} />
    );
}

export default AddEmployee;
