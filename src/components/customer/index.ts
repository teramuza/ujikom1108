import CustomerController from "@component/customer/customer.controller";
import {Router} from "express";

const router = Router();

router.get('/stats', CustomerController.getCustomerStats.bind(CustomerController));

router.get('/individual', CustomerController.getIndividualCustomers.bind(CustomerController));

router.get('/perusahaan/:perusahaan_id', CustomerController.getCustomersByPerusahaan.bind(CustomerController));

router.get('/', CustomerController.getAllCustomer.bind(CustomerController));

router.get('/:id', CustomerController.getCustomerById.bind(CustomerController));

router.post('/', CustomerController.createCustomer.bind(CustomerController));

router.put('/:id', CustomerController.updateCustomer.bind(CustomerController));

router.delete('/:id', CustomerController.deleteCustomer.bind(CustomerController));

export default router;
