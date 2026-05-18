import React, { useState, useEffect, useContext } from "react";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import DataTable from "react-data-table-component";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import FormsHeader from "../../Components/Common/FormsModalHeader";
import { AuthContext } from "../../context/AuthContext";
import { searchFeePayments } from "../../api/feePayments.api";

const STATUS_BADGE = { pending: "warning", success: "success", failed: "danger", refunded: "secondary" };

const FeePayments = () => {
    const { adminData } = useContext(AuthContext);

    const [query, setQuery] = useState("");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(100);
    const [pageNo, setPageNo] = useState(0);
    const [column, setColumn] = useState();
    const [sortDir, setSortDir] = useState();

    useEffect(() => { fetchData(); }, [pageNo, perPage, column, sortDir, query]);

    const fetchData = async () => {
        setLoading(true);
        let skip = (pageNo - 1) * perPage;
        if (skip < 0) skip = 0;
        try {
            const res = await searchFeePayments({ skip, per_page: perPage, sorton: column, sortdir: sortDir, match: query });
            if (res.data.data.length > 0) {
                setRows(res.data.data[0].data);
                setTotalRows(res.data.data[0].count);
            } else {
                setRows([]);
            }
        } catch {
            setRows([]);
        }
        setLoading(false);
    };

    const col = [
        { name: "Sr", selector: (_, i) => i + 1, maxWidth: "50px" },
        { name: "Payment ID", selector: (r) => r.paymentId, sortable: true, sortField: "paymentId", minWidth: "130px" },
        { name: "App Ref No", selector: (r) => r.applicationRefNo, minWidth: "130px" },
        { name: "Amount (₹)", selector: (r) => r.amount, sortable: true, sortField: "amount", maxWidth: "110px" },
        { name: "Mode", selector: (r) => r.mode ?? "—", maxWidth: "100px" },
        {
            name: "Status",
            selector: (r) => (
                <span className={`badge bg-${STATUS_BADGE[r.status] ?? "secondary"}`}>{r.status}</span>
            ),
            maxWidth: "100px",
        },
        { name: "Paid At", selector: (r) => r.paidAt ? new Date(r.paidAt).toLocaleDateString("en-IN") : "—", minWidth: "110px" },
        { name: "Gateway Txn ID", selector: (r) => r.gatewayTxnId || "—", minWidth: "160px" },
    ];

    document.title = `Fee Payments | ${adminData?.companyName}`;

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb maintitle="Recruitment" title="Fee Payments" pageTitle="Recruitment" />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader>
                                    <FormsHeader formName="Fee Payment" setQuery={setQuery} showAddButton={false} />
                                </CardHeader>
                                <CardBody>
                                    <div className="table-responsive table-card mt-1 mb-1">
                                        <DataTable
                                            columns={col}
                                            data={rows}
                                            progressPending={loading}
                                            sortServer
                                            onSort={(c, d) => { setColumn(c.sortField); setSortDir(d); }}
                                            pagination
                                            paginationServer
                                            paginationTotalRows={totalRows}
                                            paginationPerPage={100}
                                            paginationRowsPerPageOptions={[50, 100, 200, totalRows]}
                                            onChangeRowsPerPage={(n) => setPerPage(n)}
                                            onChangePage={(p) => setPageNo(p)}
                                        />
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default FeePayments;
