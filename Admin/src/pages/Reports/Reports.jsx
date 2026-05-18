import React, { useContext } from "react";
import { Container, Card, CardBody } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { AuthContext } from "../../context/AuthContext";

const Reports = () => {
  const { adminData } = useContext(AuthContext);
  document.title = `Reports | ${adminData?.companyName}`;

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Reports" pageTitle="Analytics" />
        <Card>
          <CardBody className="text-center py-5">
            <i className="ri-bar-chart-2-line" style={{ fontSize: "48px", opacity: 0.25 }}></i>
            <h5 className="mt-3 text-muted">Recruitment Reports</h5>
            <p className="text-muted mb-0">
              Analytics reports will be available after Phase 7 (Admin Panel) is complete.
            </p>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default Reports;
